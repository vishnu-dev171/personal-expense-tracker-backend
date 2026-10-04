import { sendError } from "../utils/apiResponse.js";

export const validateData = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    params: req.params,
    query: req.query,
    body: req.body,
  });

  if (!result.success) {
    return sendError(res, 400, "Validation failed", result.error.issues);
  }

  req.validated = result.data;

  next();
};
