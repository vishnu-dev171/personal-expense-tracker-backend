/*
  Warnings:

  - You are about to drop the column `payment_type` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `payment_method` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other');

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "payment_type",
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;

-- DropEnum
DROP TYPE "PaymentType";
