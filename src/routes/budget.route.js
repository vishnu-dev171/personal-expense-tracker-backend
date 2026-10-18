import express from "express";
import * as budgetController from "../controllers/budget.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import { validateData } from "../middlewares/validateData.js";
import {
  getBudgetSchema,
  getBudgetByIdSchema,
  getCreateBudgetSchema,
  getUpdateBudgetSchema,
  getDeleteBudgetSchema,
} from "../schemas/budget.schema.js";

const {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} = budgetController;

const router = express.Router();

router.get(
  "/getAllBudgets",
  authenticateToken,
  validateData(getBudgetSchema),
  getAllBudgets,
);

router.get(
  "/getBudgetById/:budgetId",
  authenticateToken,
  validateData(getBudgetByIdSchema),
  getBudgetById,
);

router.post(
  "/createBudget",
  authenticateToken,
  validateData(getCreateBudgetSchema),
  createBudget,
);

router.put(
  "/updateBudget",
  authenticateToken,
  validateData(getUpdateBudgetSchema),
  updateBudget,
);

router.delete(
  "/deleteBudget/:budgetId",
  authenticateToken,
  validateData(getDeleteBudgetSchema),
  deleteBudget,
);

export { router as budgetRoutes };
