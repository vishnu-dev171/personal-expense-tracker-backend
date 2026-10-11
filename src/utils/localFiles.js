import { unlink } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export const deleteLocalFile = async (fileName) => {
  // Only allow a filename, not an arbitrary path.
  if (
    typeof fileName !== "string" ||
    !fileName ||
    path.basename(fileName) !== fileName
  ) {
    throw new Error("Invalid file name");
  }

  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    await unlink(filePath);
  } catch (error) {
    // If already deleted, that's okay.
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

export const cleanupUploadedFiles = async (files = []) => {
  const results = await Promise.allSettled(
    files.map((file) => deleteLocalFile(file.filename)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        "Could not remove uploaded file:",
        files[index].filename,
        result.reason,
      );
    }
  });
};
