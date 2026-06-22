import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type MediaItem = {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export async function getMediaForUser(userId: string): Promise<MediaItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select("id, original_filename, mime_type, size_bytes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
