import * as transactionService from "../services/transaction.service.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.validated.query.page) || 1;
    const limit = parseInt(req.validated.query.limit) || 10;
    const startDate = req.validated.query.startDate || "";
    const endDate = req.validated.query.endDate || "";
    const search = req.validated.query.search || "";
    const { type, categoryId, paymentMethod } = req.validated.query;
    const userId = req.user.id;

    const { transactions, totalRecords } = await transactionService.getAll({
      page,
      limit,
      search,
      startDate,
      endDate,
      type,
      categoryId,
      paymentMethod,
      userId,
    });
    sendSuccess(res, 200, "Transactions retrieved successfully", {
      transactions,
      page,
      limit,
      totalRecords,
    });
  } catch (err) {
    next(err);
  }
};

export const getTransactionById = async (req, res, next) => {
  const transactionId = req.validated.params.transactionId;
  const userId = req.user.id;
  try {
    const transaction = await transactionService.getById(transactionId, userId);
    if (!transaction) {
      return sendError(res, 404, "Transaction not found");
    }
    sendSuccess(res, 200, "Transaction retrieved successfully", transaction);
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  const body = req.validated.body;
  const userId = req.user.id;
  const files = req.files ?? [];

  try {
    const transaction = await transactionService.create({
      ...body,
      userId,
      files,
    });
    sendSuccess(res, 201, "Transaction created successfully", transaction);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  const userId = req.user.id;
  const body = req.validated.body;
  const transactionId = body.transactionId;
  const files = req.files ?? [];
  try {
    const transaction = await transactionService.update(transactionId, {
      ...body,
      userId,
      files,
    });
    sendSuccess(res, 200, "Transaction updated successfully", transaction);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  const transactionId = req.validated.params.transactionId;
  const userId = req.user.id;
  try {
    await transactionService.deleteTransaction(transactionId, userId);
    sendSuccess(res, 200, "Transaction deleted successfully");
  } catch (error) {
    next(error);
  }
};
