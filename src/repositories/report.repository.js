import prisma from "../config/prismaClient.js";

const buildTransactionWhere = ({
  userId,
  startDate,
  endDate,
  type,
  categoryId,
}) => ({
  userId,

  ...(startDate || endDate
    ? {
        transactionDate: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lt: endDate }),
        },
      }
    : {}),

  ...(type && { type }),
  ...(categoryId && { categoryId }),
});

export const getMonthlyTotals = async (filters) => {
  return prisma.transaction.groupBy({
    by: ["type"],
    where: buildTransactionWhere(filters),
    _sum: { amount: true },
  });
};

export const getTrendTransactions = async (filters) => {
  return prisma.transaction.findMany({
    where: buildTransactionWhere(filters),
    select: {
      type: true,
      amount: true,
      transactionDate: true,
    },
    orderBy: { transactionDate: "asc" },
  });
};

export const getExpenseBreakdownTransactions = async (filters) => {
  return prisma.transaction.findMany({
    where: {
      ...buildTransactionWhere(filters),
      type: "EXPENSE",
    },
    select: {
      amount: true,
      categoryId: true,
      category: {
        select: { name: true },
      },
    },
  });
};
