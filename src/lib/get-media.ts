import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type MediaItem = {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  captured_at: string | null;
  note: string | null;
  featured: boolean;
  title: string | null;
  collection_id: string | null;
};

const SELECT_FIELDS =
  "id, original_filename, mime_type, size_bytes, created_at, captured_at, note, featured, title, collection_id";

export async function getMediaForUser(userId: string): Promise<MediaItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select(SELECT_FIELDS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getFeaturedMedia(): Promise<MediaItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select(SELECT_FIELDS)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
