/*
  Warnings:

  - Added the required column `payment_type` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "payment_type" "PaymentType" NOT NULL;
