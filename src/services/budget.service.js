import AppError from "../utils/AppError.js";
import * as budgetRepository from "../repositories/budget.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";
import * as transactionRepository from "../repositories/transaction.repository.js";

const getSpent = async ({ userId, categoryId, month, year }) => {
  return transactionRepository.getSpentByCategoryAndPeriod({
    userId,
    categoryId,
    month,
    year,
  });
};

const formatBudget = async (budget) => {
  const { category, ...budgetData } = budget;

  const spent = Number(
    await getSpent({
      userId: budget.userId,
      categoryId: budget.categoryId,
      month: budget.month,
      year: budget.year,
    }),
  );

  const amount = Number(budget.amount);

  return {
    ...budgetData,
    amount,
    categoryName: category.name,
    spent,
    remaining: amount - spent,
    percentageUsed:
      amount > 0 ? Number(((spent / amount) * 100).toFixed(2)) : 0,
  };
};

export const getAll = async (options) => {
  const { page, limit, search, userId, month, year, categoryId } = options;

  const skip = (page - 1) * limit;

  const { budgets, totalRecords } = await budgetRepository.getAll({
    skip,
    limit,
    search,
    userId,
    month,
    year,
    categoryId,
  });

  return {
    budgets: await Promise.all(budgets.map(formatBudget)),
    totalRecords,
  };
};

export const getById = async (budgetId, userId) => {
  const budget = await budgetRepository.getById(budgetId, userId);

  if (!budget) {
    return null;
  }

  return formatBudget(budget);
};

export const create = async (data) => {
  const { userId, categoryId } = data;

  // Verify category ownership
  const category = await categoryRepository.getById(categoryId, userId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Budgets are allowed only for expense categories
  if (category.type !== "EXPENSE") {
    throw new AppError(
      "Budget can only be created for expense categories",
      400,
    );
  }

  const budget = await budgetRepository.create(data);

  return formatBudget(budget);
};

export const update = async (budgetId, data) => {
  const { userId, categoryId } = data;

  // Verify budget ownership
  const existingBudget = await budgetRepository.getById(budgetId, userId);

  if (!existingBudget) {
    throw new AppError("Budget not found", 404);
  }

  // Verify the selected category belongs to this user
  const category = await categoryRepository.getById(categoryId, userId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Budgets are allowed only for expense categories
  if (category.type !== "EXPENSE") {
    throw new AppError(
      "Budget can only be assigned to expense categories",
      400,
    );
  }

  const updatedBudget = await budgetRepository.update(budgetId, {
    ...data,
    userId,
  });

  return formatBudget(updatedBudget);
};

export const deleteBudget = async (budgetId, userId) => {
  const budget = await budgetRepository.getById(budgetId, userId);

  if (!budget) {
    throw new AppError("Budget not found", 404);
  }

  await budgetRepository.deleteBudget(budgetId, userId);
};
