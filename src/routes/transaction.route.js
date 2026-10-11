import express from "express";
import * as transactionController from "../controllers/transcation.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import { validateData } from "../middlewares/validateData.js";
import {
  getCreateTransactionSchema,
  getTransactionByIdSchema,
  getTransactionSchema,
  getUpdateTransactionSchema,
} from "../schemas/transaction.schema.js";
import { upload } from "../config/multer.js";

const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = transactionController;

const router = express.Router();

router.get(
  "/getAllTransactions",
  authenticateToken,
  validateData(getTransactionSchema),
  getAllTransactions,
);
router.get(
  "/getTransactionById/:transactionId",
  authenticateToken,
  validateData(getTransactionByIdSchema),
  getTransactionById,
);
router.post(
  "/createTransaction",
  authenticateToken,
  upload.array("attachments", 5),
  validateData(getCreateTransactionSchema),
  createTransaction,
);
router.put(
  "/updateTransaction",
  authenticateToken,
  upload.array("attachments", 5),
  validateData(getUpdateTransactionSchema),
  updateTransaction,
);
router.delete(
  "/deleteTransaction/:transactionId",
  authenticateToken,
  validateData(getTransactionByIdSchema),
  deleteTransaction,
);

export { router as transactionRoutes };
