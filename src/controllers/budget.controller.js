import * as budgetService from "../services/budget.service.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const getAllBudgets = async (req, res, next) => {
  try {
    const page = parseInt(req.validated.query.page) || 1;
    const limit = parseInt(req.validated.query.limit) || 10;
    const search = req.validated.query.search || "";
    const { month, year, categoryId } = req.validated.query;
    const userId = req.user.id;

    const { budgets, totalRecords } = await budgetService.getAll({
      page,
      limit,
      search,
      month,
      year,
      categoryId,
      userId,
    });

    sendSuccess(res, 200, "Budgets retrieved successfully", {
      budgets,
      page,
      limit,
      totalRecords,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetById = async (req, res, next) => {
  const budgetId = req.validated.params.budgetId;
  const userId = req.user.id;

  try {
    const budget = await budgetService.getById(budgetId, userId);

    if (!budget) {
      return sendError(res, 404, "Budget not found");
    }

    sendSuccess(res, 200, "Budget retrieved successfully", budget);
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req, res, next) => {
  const body = req.validated.body;
  const userId = req.user.id;

  try {
    const budget = await budgetService.create({
      ...body,
      userId,
    });

    sendSuccess(res, 201, "Budget created successfully", budget);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  const budgetId = req.validated.body.budgetId;
  const body = req.validated.body;
  const userId = req.user.id;

  try {
    const budget = await budgetService.update(budgetId, {
      ...body,
      userId,
    });

    if (!budget) {
      return sendError(res, 404, "Budget not found");
    }

    sendSuccess(res, 200, "Budget updated successfully", budget);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  const budgetId = req.validated.params.budgetId;
  const userId = req.user.id;

  try {
    await budgetService.deleteBudget(budgetId, userId);
    sendSuccess(res, 200, "Budget deleted successfully");
  } catch (error) {
    next(error);
  }
};
