export const getExpenseType = (searchTerm) => {
  return ["income", "expense"].includes(searchTerm?.toLowerCase())
    ? searchTerm.toUpperCase()
    : null;
};

export const normalizeDate = (date) => {
  if (!date) return undefined;

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

export const getNextDay = (date) => {
  const nextDay = new Date(date);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return nextDay;
};

export const getMonthKey = (date) => {
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
};

export const getMonthLabel = (date) => {
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) + ` ${String(date.getUTCFullYear()).slice(-2)}`
  );
};

export const getMonthStart = (year, monthIndex) => {
  return new Date(Date.UTC(year, monthIndex, 1));
};
