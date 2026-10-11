import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import { validateData } from "../middlewares/validateData.js";
import {
  getCategoryByIdSchema,
  getCategorySchema,
  getCreateCategorySchema,
  getUpdateCategorySchema,
} from "../schemas/category.schema.js";

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  activateCategory,
  deactivateCategory,
  getCategoriesDropdown,
} = categoryController;

const router = express.Router();

router.get(
  "/getAllCategories",
  authenticateToken,
  validateData(getCategorySchema),
  getAllCategories,
);

router.get(
  "/getCategoryById/:categoryId",
  authenticateToken,
  validateData(getCategoryByIdSchema),
  getCategoryById,
);

router.get("/getCategoriesDropdown", authenticateToken, getCategoriesDropdown);

router.post(
  "/createCategory",
  authenticateToken,
  validateData(getCreateCategorySchema),
  createCategory,
);

router.put(
  "/updateCategory",
  authenticateToken,
  validateData(getUpdateCategorySchema),
  updateCategory,
);

router.put(
  "/activateCategory/:categoryId",
  authenticateToken,
  validateData(getCategoryByIdSchema),
  activateCategory,
);

router.put(
  "/deactivateCategory/:categoryId",
  authenticateToken,
  validateData(getCategoryByIdSchema),
  deactivateCategory,
);

export { router as categoryRoutes };
