import { sendError } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error", stack } = err;
  console.error(stack);
  sendError(res, statusCode, message);
  next();
};
