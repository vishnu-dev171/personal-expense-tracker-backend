import AppError from "../utils/AppError.js";
import * as transactionRepository from "../repositories/transaction.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";
import { deleteLocalFile } from "../utils/localFiles.js";

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
  const newTransaction = await transactionRepository.create({ ...data, type });

  return {
    ...newTransaction,
    amount: Number(newTransaction.amount),
    categoryName: category.name,
  };
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

  const { updatedTransaction, deletedFiles } =
    await transactionRepository.update(
      transactionId,
      {
        ...otherFields,
        categoryId,
        type,
        transactionDate: parsedDate,
        files,
      },
      deleteFileIds,
    );

  // PostgreSQL transaction has succeeded.
  // Now remove the physical files from uploads/.
  const results = await Promise.allSettled(
    deletedFiles.map((file) => deleteLocalFile(file.fileName)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        "Database record deleted, but physical file cleanup failed:",
        deletedFiles[index].fileName,
        result.reason,
      );
    }
  });

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
  // Delete transaction and its file records from the database
  const files = await transactionRepository.deleteTransaction(
    transactionId,
    userId,
  );

  // Delete the actual uploaded files from disk
  const results = await Promise.allSettled(
    files.map((file) => deleteLocalFile(file.fileName)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        "Could not delete physical transaction file:",
        files[index].fileName,
        result.reason,
      );
    }
  });
};
