-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('INR', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" "CurrencyType" NOT NULL DEFAULT 'INR',
ADD COLUMN     "default_transaction_type" "TransactionType" NOT NULL DEFAULT 'EXPENSE';
