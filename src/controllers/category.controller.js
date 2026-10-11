import { sendError, sendSuccess } from "../utils/apiResponse.js";
import * as categoryService from "../services/category.service.js";

export const getAllCategories = async (req, res, next) => {
  const page = parseInt(req.validated.query.page) || 1;
  const limit = parseInt(req.validated.query.limit) || 10;
  const search = req.validated.query.search || "";
  const userId = req.user.id;
  try {
    const { categories, totalRecords } = await categoryService.getAll({
      page,
      limit,
      search,
      userId,
    });
    sendSuccess(res, 200, "Categories retrieved successfully", {
      categories,
      page,
      limit,
      totalRecords,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  const categoryId = req.validated.params.categoryId;
  const userId = req.user.id;
  try {
    const category = await categoryService.getById(categoryId, userId);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }
    sendSuccess(res, 200, "Category retrieved successfully", category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  const body = req.validated.body;
  const userId = req.user.id;
  try {
    const category = await categoryService.create({ ...body, userId });
    sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  const userId = req.user.id;
  const body = req.validated.body;
  const categoryId = body.categoryId;
  try {
    const category = await categoryService.update(categoryId, {
      ...body,
      userId,
    });
    sendSuccess(res, 200, "Category updated successfully", category);
  } catch (error) {
    next(error);
  }
};

export const deactivateCategory = async (req, res, next) => {
  const categoryId = req.validated.params.categoryId;
  const userId = req.user.id;
  try {
    await categoryService.deactivate(categoryId, userId);
    sendSuccess(res, 200, "Category deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const activateCategory = async (req, res, next) => {
  const categoryId = req.validated.params.categoryId;
  const userId = req.user.id;
  try {
    await categoryService.activate(categoryId, userId);
    sendSuccess(res, 200, "Category activated successfully");
  } catch (error) {
    next(error);
  }
};

export const getCategoriesDropdown = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const categories = await categoryService.getCategoriesDropdown({ userId });
    sendSuccess(res, 200, "Categories retrieved successfully", categories);
  } catch (error) {
    next(error);
  }
};
