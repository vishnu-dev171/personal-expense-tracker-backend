import prisma from "../config/prismaClient.js";

export const create = async (userId, tokenHash, expiresAt) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
};

export const findByHash = async (tokenHash) => {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          userId: true,
          name: true,
          status: true,
        },
      },
    },
  });
};

export const rotate = async ({ oldTokenId, userId, tokenHash, expiresAt }) => {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    // Only one concurrent request can consume this token.
    const consumed = await tx.refreshToken.updateMany({
      where: {
        refreshTokenId: oldTokenId,
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        revokedAt: now,
      },
    });

    if (consumed.count !== 1) {
      return false;
    }

    await tx.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return true;
  });
};

export const revokeByHash = async (tokenHash) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};
