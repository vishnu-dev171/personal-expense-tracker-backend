import prisma from "../config/prismaClient.js";

const commonSelectFields = {
  budgetId: true,
  userId: true,
  categoryId: true,
  amount: true,
  month: true,
  year: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      name: true,
    },
  },
};

export const getAll = async (options) => {
  const { skip, limit, search, userId, month, year, categoryId } = options;

  const where = {
    userId,
  };

  if (month !== undefined) {
    where.month = Number(month);
  }

  if (year !== undefined) {
    where.year = Number(year);
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search?.trim()) {
    where.category = {
      is: {
        name: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
    };
  }

  const [budgets, totalRecords] = await Promise.all([
    prisma.budget.findMany({
      skip,
      take: limit,
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
      select: commonSelectFields,
      where,
    }),

    prisma.budget.count({ where }),
  ]);

  return { budgets, totalRecords };
};

export const getById = async (budgetId, userId) => {
  return prisma.budget.findUnique({
    where: {
      budgetId,
      userId,
    },
    select: commonSelectFields,
  });
};

export const create = async (data) => {
  return prisma.budget.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      amount: data.amount,
      month: data.month,
      year: data.year,
    },
    select: commonSelectFields,
  });
};

export const update = async (budgetId, data) => {
  return prisma.budget.update({
    where: {
      budgetId,
      userId: data.userId,
    },
    data: {
      categoryId: data.categoryId,
      amount: data.amount,
      month: data.month,
      year: data.year,
    },
    select: commonSelectFields,
  });
};

export const deleteBudget = async (budgetId, userId) => {
  return prisma.budget.delete({
    where: {
      budgetId,
      userId,
    },
  });
};
