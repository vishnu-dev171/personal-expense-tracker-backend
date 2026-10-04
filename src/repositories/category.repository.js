import prisma from "../config/prismaClient.js";

const commonSelectFields = {
  categoryId: true,
  name: true,
  type: true,
  status: true,
};

export const getAll = async ({ skip, limit, search, userId }) => {
  const [categories, totalRecords] = await Promise.all([
    prisma.category.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      select: commonSelectFields,
      where: {
        userId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
    prisma.category.count(),
  ]);
  return { categories, totalRecords };
};

export const getById = async (categoryId, userId) => {
  const category = await prisma.category.findUnique({
    where: { categoryId, userId },
    select: commonSelectFields,
  });
  return category;
};

export const findByNameAndType = async (name, type, userId) => {
  const category = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      type,
      userId,
    },
  });
  return category;
};

export const create = async (data) => {
  const newCategory = await prisma.category.create({
    data,
    select: commonSelectFields,
  });
  return newCategory;
};

export const update = async (categoryId, data) => {
  const updatedCategory = await prisma.category.update({
    where: { categoryId },
    data,
    select: commonSelectFields,
  });
  return updatedCategory;
};

export const deactivate = async (categoryId, userId) => {
  const deactivatedCategory = await prisma.category.update({
    where: { categoryId, userId },
    data: { status: "INACTIVE" },
  });
  return deactivatedCategory;
};
export const activate = async (categoryId, userId) => {
  const activatedCategory = await prisma.category.update({
    where: { categoryId, userId },
    data: { status: "ACTIVE" },
  });
  return activatedCategory;
};
