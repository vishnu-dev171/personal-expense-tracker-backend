import prisma from "../config/prismaClient.js";

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData,
  });
};

export const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      email: true,
      name: true,
      status: true,
      currency: true,
      defaultTransactionType: true,
      status: true,
    },
  });
};

export const update = async (data, userId) => {
  const updatedUser = await prisma.user.update({
    where: { userId },
    data,
    select: {
      userId: true,
      name: true,
      email: true,
      currency: true,
      defaultTransactionType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updatedUser;
};
