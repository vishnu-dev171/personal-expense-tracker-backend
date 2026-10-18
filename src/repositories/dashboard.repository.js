import prisma from "../config/prismaClient.js";

export const getMonthlyTotals = async ({ userId, startDate, endDate }) => {
  return prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });
};

export const getTrendTransactions = async ({ userId, startDate, endDate }) => {
  return prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      type: {
        in: ["INCOME", "EXPENSE"],
      },
    },
    select: {
      type: true,
      amount: true,
      transactionDate: true,
    },
  });
};

export const getCurrentMonthExpenses = async ({
  userId,
  startDate,
  endDate,
}) => {
  return prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: {
      amount: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const getMonthlyBudgetTotal = async ({ userId, month, year }) => {
  const result = await prisma.budget.aggregate({
    where: {
      userId,
      month,
      year,
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount ?? 0;
};
