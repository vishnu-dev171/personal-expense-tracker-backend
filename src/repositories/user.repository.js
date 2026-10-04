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
    select: { userId: true, email: true, name: true, status: true },
  });
};
