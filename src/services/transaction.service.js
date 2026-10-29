import AppError from "../utils/AppError.js";
import * as transactionRepository from "../repositories/transaction.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";
import {
  uploadTransactionFile,
  deleteStorageFiles,
} from "./storage.service.js";

const paymentMethodMap = {
  Cash: "Cash",
  UPI: "UPI",
  "Credit Card": "Credit_Card",
  "Debit Card": "Debit_Card",
  "Bank Transfer": "Bank_Transfer",
  Other: "Other",
};

const uploadFilesSafely = async (files, userId) => {
  const uploadedFiles = [];

  try {
    for (const file of files) {
      const uploadedFile = await uploadTransactionFile(file, userId);
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  } catch (error) {
    // Clean up any files uploaded before the failure.
    try {
      await deleteStorageFiles(uploadedFiles.map((file) => file.filePath));
    } catch (cleanupError) {
      console.error(
        "Failed to clean up partially uploaded files:",
        cleanupError,
      );
    }

    throw error;
  }
};

const cleanupNewUploads = async (files) => {
  try {
    await deleteStorageFiles(files.map((file) => file.filePath));
  } catch (error) {
    console.error("Failed to clean up new Supabase files:", error);
  }
};

export const getAll = async (options) => {
  const {
    page,
    limit,
    search,
    userId,
    startDate,
    endDate,
    type,
    categoryId,
    paymentMethod,
  } = options;
  const skip = (page - 1) * limit;

  const { transactions, totalRecords } = await transactionRepository.getAll({
    skip,
    limit,
    search,
    startDate,
    endDate,
    type: type?.toUpperCase(),
    categoryId,
    paymentMethod,
    userId,
  });

  return {
    transactions: transactions.map(({ category, ...transaction }) => ({
      ...transaction,
      amount: Number(transaction.amount),
      categoryName: category.name,
    })),
    totalRecords,
  };
};

export const getById = async (transactionId, userId) => {
  const transaction = await transactionRepository.getById(
    transactionId,
    userId,
  );
  if (!transaction) return transaction;
  const { category, ...transactionData } = transaction;
  return {
    ...transactionData,
    amount: Number(transactionData.amount),
    categoryName: category.name,
  };
};

export const create = async (data) => {
  const { userId, categoryId, transactionDate } = data;
  const type = data.type.toUpperCase();
  const category = await categoryRepository.getById(categoryId, userId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Ensure category type matches transaction type
  if (category.type !== type) {
    throw new AppError("Category type must match transaction type", 400);
  }

  // Validate the transaction date
  const parsedDate = new Date(transactionDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("Invalid transaction date", 400);
  }

  // Compare calendar dates because the column uses @db.Date
  const dateOnly = (date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly(parsedDate) > dateOnly(new Date())) {
    throw new AppError("Transaction date cannot be in the future", 400);
  }

  // Upload files first.
  const uploadedFiles = await uploadFilesSafely(data.files ?? [], userId);

  try {
    const newTransaction = await transactionRepository.create({
      ...data,
      type,
      transactionDate: parsedDate,
      paymentMethod: paymentMethodMap[data?.paymentMethod ?? ""],
      files: uploadedFiles,
    });

    return {
      ...newTransaction,
      amount: Number(newTransaction.amount),
      categoryName: category.name,
    };
  } catch (error) {
    await cleanupNewUploads(uploadedFiles);
    throw error;
  }
};

export const update = async (transactionId, data) => {
  const {
    userId,
    categoryId,
    transactionDate,
    deleteFileIds = [],
    files = [],
    type: rawType,
    ...otherFields
  } = data;

  const type = rawType.toUpperCase();

  // Verify transaction ownership
  const transaction = await transactionRepository.getById(
    transactionId,
    userId,
  );

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  // Verify category ownership
  const category = await categoryRepository.getById(categoryId, userId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Ensure category type matches transaction type
  if (category.type !== type) {
    throw new AppError("Category type must match transaction type", 400);
  }

  // Validate the transaction date
  const parsedDate = new Date(transactionDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("Invalid transaction date", 400);
  }

  // Compare calendar dates because the column uses @db.Date
  const dateOnly = (date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly(parsedDate) > dateOnly(new Date())) {
    throw new AppError("Transaction date cannot be in the future", 400);
  }

  // Validate deleteFileIds format
  if (
    !Array.isArray(deleteFileIds) ||
    !deleteFileIds.every((id) => typeof id === "string")
  ) {
    throw new AppError("Invalid deleteFileIds", 400);
  }

  const uploadedFiles = await uploadFilesSafely(files, userId);

  let result;

  try {
    result = await transactionRepository.update(
      transactionId,
      {
        ...otherFields,
        categoryId,
        type,
        paymentMethod: paymentMethodMap[data?.paymentMethod ?? ""],
        transactionDate: parsedDate,
        files: uploadedFiles,
      },
      deleteFileIds,
    );
  } catch (error) {
    await cleanupNewUploads(uploadedFiles);
    throw error;
  }

  const { updatedTransaction, deletedFiles } = result;

  // The database transaction has succeeded.
  // Remove the old objects from Supabase.
  try {
    await deleteStorageFiles(deletedFiles.map((file) => file.filePath));
  } catch (error) {
    console.error(
      "Database records were deleted, but Supabase file cleanup failed:",
      error,
    );
  }

  const { category: updatedCategory, ...transactionData } = updatedTransaction;

  return {
    ...transactionData,
    amount: Number(transactionData.amount),
    categoryName: updatedCategory.name,
  };
};

export const deleteTransaction = async (transactionId, userId) => {
  const transaction = await transactionRepository.getById(
    transactionId,
    userId,
  );

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  // Delete the transaction and its file metadata from PostgreSQL.
  const files = await transactionRepository.deleteTransaction(
    transactionId,
    userId,
  );

  // Delete the corresponding objects from Supabase.
  try {
    await deleteStorageFiles(files.map((file) => file.filePath));
  } catch (error) {
    console.error(
      "Transaction was deleted, but Supabase file cleanup failed:",
      error,
    );
  }
};
