import "server-only";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { RETENTION_DAYS, uploadRoot } from "@/lib/media";

export async function cleanupExpiredMedia(): Promise<number> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select("id, storage_path")
    .lt("created_at", cutoff);

  if (error || !data || data.length === 0) return 0;

  for (const row of data) {
    await unlink(path.join(uploadRoot(), row.storage_path)).catch(() => {});
  }

  await admin.from("media").delete().in("id", data.map((row) => row.id));

  return data.length;
}
