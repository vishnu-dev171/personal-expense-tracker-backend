import * as reportRepository from "../repositories/report.repository.js";
import {
  getMonthKey,
  getMonthLabel,
  getMonthStart,
  getNextDay,
  normalizeDate,
} from "../utils/helper.js";

const buildMonthlyTrend = (transactions, startDate, endDate) => {
  const monthlyMap = new Map();

  // Initialize every month in the requested trend range.
  let current = getMonthStart(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
  );

  const lastMonth = getMonthStart(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
  );

  while (current <= lastMonth) {
    monthlyMap.set(getMonthKey(current), {
      month: getMonthLabel(current),
      income: 0,
      expense: 0,
    });

    current = getMonthStart(
      current.getUTCFullYear(),
      current.getUTCMonth() + 1,
    );
  }

  // Add transaction amounts to the corresponding month.
  for (const transaction of transactions) {
    const date = new Date(transaction.transactionDate);
    const entry = monthlyMap.get(getMonthKey(date));

    if (!entry) continue;

    if (transaction.type === "INCOME") {
      entry.income += Number(transaction.amount);
    } else if (transaction.type === "EXPENSE") {
      entry.expense += Number(transaction.amount);
    }
  }

  return Array.from(monthlyMap.values());
};

export const getReports = async ({
  userId,
  startDate,
  endDate,
  type,
  categoryId,
}) => {
  const now = new Date();

  const currentMonthStart = getMonthStart(now.getFullYear(), now.getMonth());

  const nextMonthStart = getMonthStart(now.getFullYear(), now.getMonth() + 1);

  // Default: current month plus the previous five months.
  const defaultTrendStart = getMonthStart(
    now.getFullYear(),
    now.getMonth() - 5,
  );

  const normalizedType = type ? type.toUpperCase() : undefined;

  const normalizedStartDate = normalizeDate(startDate);

  // The selected end date must be included in the report.
  const normalizedEndDate = endDate
    ? getNextDay(normalizeDate(endDate))
    : undefined;

  const filters = {
    userId,
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
    type: normalizedType,
    categoryId,
  };

  // Trend uses the selected date range when supplied.
  // Otherwise, it defaults to the past six months.
  const trendStartDate = normalizedStartDate ?? defaultTrendStart;

  const trendEndDate = normalizedEndDate ?? nextMonthStart;

  const trendFilters = {
    ...filters,
    startDate: trendStartDate,
    endDate: trendEndDate,
  };

  const [monthlyTotals, trendTransactions, categoryTransactions] =
    await Promise.all([
      reportRepository.getMonthlyTotals(filters),

      reportRepository.getTrendTransactions(trendFilters),

      // An income-only report has no expense breakdown.
      normalizedType === "INCOME"
        ? Promise.resolve([])
        : reportRepository.getExpenseBreakdownTransactions(filters),
    ]);

  // 1. Summary cards
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

  const monthlyTrend = buildMonthlyTrend(
    trendTransactions,
    trendStartDate,
    // End date is exclusive, so use the previous day to determine
    // the final month that belongs in the trend.
    new Date(trendEndDate.getTime() - 24 * 60 * 60 * 1000),
  );

  // 3. Expense breakdown by category
  const categoryMap = new Map();

  for (const transaction of categoryTransactions) {
    const { categoryId, category, amount } = transaction;

    const entry = categoryMap.get(categoryId) ?? {
      categoryId,
      name: category.name,
      value: 0,
    };

    entry.value += Number(amount);
    categoryMap.set(categoryId, entry);
  }

  const expenseBreakdown = Array.from(categoryMap.values()).sort(
    (a, b) => b.value - a.value,
  );

  return {
    summary: {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
    },
    monthlyTrend,
    expenseBreakdown,
  };
};
