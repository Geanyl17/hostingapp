import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Collection = {
  id: string;
  name: string;
  created_at: string;
};

export async function getCollectionsForUser(userId: string): Promise<Collection[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("collections")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}
