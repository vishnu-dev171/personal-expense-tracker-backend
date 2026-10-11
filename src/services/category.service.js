import * as categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/AppError.js";

export const getAll = async ({ page, limit, search, userId }) => {
  const skip = (page - 1) * limit;
  const { categories, totalRecords } = await categoryRepository.getAll({
    skip,
    limit,
    search,
    userId,
  });
  return { categories, totalRecords };
};

export const getById = async (categoryId, userId) => {
  const category = await categoryRepository.getById(categoryId, userId);
  return category;
};

export const create = async (data) => {
  const { name, userId } = data;
  const type = data.type.toUpperCase();
  const existingCategory = await categoryRepository.findByNameAndType(
    name,
    type,
    userId,
  );
  if (existingCategory) {
    throw new AppError(
      "Category with the same name and type already exists",
      400,
    );
  } else {
    const newCategory = await categoryRepository.create({
      name,
      type,
      userId,
    });
    return newCategory;
  }
};

export const update = async (categoryId, data) => {
  const { name, userId } = data;
  const type = data.type.toUpperCase();
  const category = await categoryRepository.getById(categoryId, userId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  const existingCategory = await categoryRepository.findByNameAndType(
    name,
    type,
    userId,
  );
  if (existingCategory && existingCategory.categoryId !== categoryId) {
    throw new AppError(
      "Category with the same name and type already exists",
      400,
    );
  }
  const updatedCategory = await categoryRepository.update(categoryId, {
    name,
    type,
  });
  return updatedCategory;
};

export const deactivate = async (categoryId, userId) => {
  const category = await categoryRepository.getById(categoryId, userId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  if (category.status === "INACTIVE") {
    throw new AppError("Category is already deactivated", 400);
  }
  const deactivatedCategory = await categoryRepository.deactivate(
    categoryId,
    userId,
  );
  return deactivatedCategory;
};
export const activate = async (categoryId, userId) => {
  const category = await categoryRepository.getById(categoryId, userId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  if (category.status === "ACTIVE") {
    throw new AppError("Category is already active", 400);
  }
  const activatedCategory = await categoryRepository.activate(
    categoryId,
    userId,
  );
  return activatedCategory;
};

export const getCategoriesDropdown = async ({ userId }) => {
  return await categoryRepository.getCategoriesDropdown({ userId });
};
