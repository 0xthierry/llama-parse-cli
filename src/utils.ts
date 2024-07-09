import fs from "node:fs";
import path from "node:path";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mimeTypes = {
  ".txt": "text/plain",
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
};

const resolveMimeType = (file: string) => {
  const ext = path.extname(file);
  return mimeTypes[ext as keyof typeof mimeTypes];
};

export const fileToBlob = async (
  file: string
): Promise<{
  filename: string;
  blob: Blob;
}> => {
  const buffer = await fs.promises.readFile(file);
  const blob = new Blob([buffer], { type: resolveMimeType(file) });
  return {
    filename: path.basename(file),
    blob,
  };
};
