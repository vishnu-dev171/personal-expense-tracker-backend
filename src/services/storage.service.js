import crypto from "crypto";
import path from "path";
import supabase from "../config/supabase.js";
import AppError from "../utils/AppError.js";

const BUCKET = process.env.SUPABASE_BUCKET;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

export async function uploadTransactionFile(file, userId) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new AppError("Unsupported file type");
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const fileName = `${crypto.randomUUID()}${extension}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError(`File upload failed: ${error.message}`);
  }

  return {
    originalName: file.originalname,
    fileName,
    filePath: data.path,
    mimeType: file.mimetype,
    fileSize: file.size,
  };
}

export async function deleteStorageFiles(filePath) {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  if (error) {
    throw new AppError(`File deletion failed: ${error.message}`);
  }
}

export async function createFileSignedUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60 * 5);

  if (error) {
    throw new AppError("Unable to create file download URL");
  }

  return data.signedUrl;
}
