export const getExpenseType = (searchTerm) => {
  return ["income", "expense"].includes(searchTerm?.toLowerCase())
    ? searchTerm.toUpperCase()
    : null;
};
