import prisma from "../config/prismaClient.js";
import { getExpenseType } from "../utils/helper.js";

const commonSelectFields = {
  transactionId: true,
  categoryId: true,
  amount: true,
  type: true,
  paymentMethod: true,
  description: true,
  notes: true,
  transactionDate: true,
  files: true,
  category: {
    select: {
      name: true,
    },
  },
};

export const getAll = async (options) => {
  const {
    skip,
    limit,
    search,
    userId,
    category,
    type,
    startDate,
    endDate,
    paymentMethod,
    categoryId,
  } = options;
  // Filters
  const searchTerm = search?.trim();
  const searchType = getExpenseType(searchTerm);
  const where = {
    userId,
  };

  if (category) {
    where.category = {
      is: {
        name: {
          contains: category,
          mode: "insensitive",
        },
      },
    };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    const dateFilter = {};

    if (startDate) {
      dateFilter.gte = startDate;
    }

    if (endDate) {
      const endExclusive = new Date(endDate);
      endExclusive.setDate(endExclusive.getDate() + 1);
      dateFilter.lt = endExclusive;
    }

    where.transactionDate = dateFilter;
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  if (searchTerm) {
    where.OR = [
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        category: {
          is: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      },
      ...(searchType ? [{ type: searchType }] : []),
    ];
  }

  const [transactions, totalRecords] = await Promise.all([
    prisma.transaction.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      select: commonSelectFields,
      where,
    }),
    prisma.transaction.count({ where }),
  ]);
  return { transactions, totalRecords };
};

export const getById = async (transactionId, userId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { transactionId, userId },
    select: commonSelectFields,
  });
  return transaction;
};

export const create = async (data) => {
  const { files = [], ...transactionData } = data;
  const newTransaction = await prisma.transaction.create({
    data: {
      ...transactionData,

      files: {
        create: files.map((file) => ({
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          mimeType: file.mimetype,
          fileSize: file.size,
        })),
      },
    },
    include: {
      files: true,
    },
  });
  return newTransaction;
};

export const update = async (transactionId, data, deleteFileIds = []) => {
  const { files = [], ...transactionData } = data;
  const uniqueFileIds = [...new Set(deleteFileIds)];

  return prisma.$transaction(async (tx) => {
    let deletedFiles = [];

    if (uniqueFileIds.length > 0) {
      // Get file names before removing their records.
      deletedFiles = await tx.transactionFile.findMany({
        where: {
          transactionId,
          fileId: { in: uniqueFileIds },
        },
        select: {
          fileId: true,
          fileName: true,
        },
      });

      if (deletedFiles.length !== uniqueFileIds.length) {
        throw new AppError("File not found", 404);
      }

      // Remove records from PostgreSQL.
      await tx.transactionFile.deleteMany({
        where: {
          transactionId,
          fileId: { in: uniqueFileIds },
        },
      });
    }

    // Update transaction and create records for new uploads.
    const updatedTransaction = await tx.transaction.update({
      where: { transactionId },
      data: {
        ...transactionData,

        ...(files.length > 0 && {
          files: {
            create: files.map((file) => ({
              originalName: file.originalname,
              fileName: file.filename,
              filePath: file.path,
              mimeType: file.mimetype,
              fileSize: file.size,
            })),
          },
        }),
      },
      select: commonSelectFields,
    });

    return { updatedTransaction, deletedFiles };
  });
};

export const deleteTransaction = async (transactionId, userId) => {
  return prisma.$transaction(async (tx) => {
    // Get filenames before the cascade deletes their database records
    const files = await tx.transactionFile.findMany({
      where: { transactionId },
      select: { fileName: true },
    });

    // Delete the transaction.
    // Related TransactionFile database records are deleted by onDelete: Cascade.
    await tx.transaction.delete({
      where: { transactionId, userId },
    });

    // Return filenames so the service can delete files from disk
    return files;
  });
};
