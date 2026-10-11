-- CreateTable
CREATE TABLE "transaction_files" (
    "file_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_files_pkey" PRIMARY KEY ("file_id")
);

-- CreateIndex
CREATE INDEX "transaction_files_transaction_id_idx"
ON "transaction_files"("transaction_id");

-- AddForeignKey
ALTER TABLE "transaction_files"
ADD CONSTRAINT "transaction_files_transaction_id_fkey"
FOREIGN KEY ("transaction_id")
REFERENCES "transactions"("transaction_id")
ON DELETE CASCADE ON UPDATE CASCADE;
