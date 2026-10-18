import * as dashboardRepository from "../repositories/dashboard.repository.js";

const getMonthStart = (year, monthIndex) =>
  new Date(Date.UTC(year, monthIndex, 1));

export const getDashboard = async (userId) => {
  const now = new Date();

  // Current month and year
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthStart = getMonthStart(currentYear, currentMonth - 1);

  const nextMonthStart = getMonthStart(currentYear, currentMonth);

  // Six months including the current month
  const trendStart = getMonthStart(currentYear, currentMonth - 6);

  const [monthlyTotals, trendTransactions, categoryTransactions, budgetTotal] =
    await Promise.all([
      dashboardRepository.getMonthlyTotals({
        userId,
        startDate: currentMonthStart,
        endDate: nextMonthStart,
      }),

      dashboardRepository.getTrendTransactions({
        userId,
        startDate: trendStart,
        endDate: nextMonthStart,
      }),

      dashboardRepository.getCurrentMonthExpenses({
        userId,
        startDate: currentMonthStart,
        endDate: nextMonthStart,
      }),

      dashboardRepository.getMonthlyBudgetTotal({
        userId,
        month: currentMonth,
        year: currentYear,
      }),
    ]);

  // Summary cards
  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of monthlyTotals) {
    const amount = Number(item._sum.amount ?? 0);

    if (item.type === "INCOME") {
      totalIncome = amount;
    } else if (item.type === "EXPENSE") {
      totalExpense = amount;
    }
  }

  // Initialize all six months, including months with no transactions
  const monthlyMap = new Map();

  for (let i = 0; i < 6; i++) {
    const date = getMonthStart(currentYear, currentMonth - 6 + i);

    const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;

    monthlyMap.set(key, {
      month:
        date.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }) + ` ${String(date.getUTCFullYear()).slice(-2)}`,
      income: 0,
      expense: 0,
    });
  }

  for (const transaction of trendTransactions) {
    const date = new Date(transaction.transactionDate);

    const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;

    const entry = monthlyMap.get(key);

    if (!entry) continue;

    if (transaction.type === "INCOME") {
      entry.income += Number(transaction.amount);
    } else if (transaction.type === "EXPENSE") {
      entry.expense += Number(transaction.amount);
    }
  }

  const monthlyTrend = Array.from(monthlyMap.values());

  // Current-month expenses grouped by category
  const categoryMap = new Map();

  for (const transaction of categoryTransactions) {
    const { categoryId, category, amount } = transaction;

    const existing = categoryMap.get(categoryId) ?? {
      categoryId,
      name: category.name,
      value: 0,
    };

    existing.value += Number(amount);
    categoryMap.set(categoryId, existing);
  }

  const expenseByCategory = Array.from(categoryMap.values()).sort(
    (a, b) => b.value - a.value,
  );

  return {
    summary: {
      month: currentMonth,
      year: currentYear,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalBudget: Number(budgetTotal),
    },
    monthlyTrend,
    expenseByCategory,
  };
};
