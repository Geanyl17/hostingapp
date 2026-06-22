import "server-only";
import path from "node:path";

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const RETENTION_DAYS = 15;

export function uploadRoot() {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.UPLOAD_DIR ?? "./uploads",
  );
}

export function buildStoragePath(userId: string, id: string, ext: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return path.join(userId, year, month, `${id}${ext}`);
}
