import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

let cachedOwnerId: string | null = null;

async function getOwnerUserId(): Promise<string | null> {
  if (cachedOwnerId) return cachedOwnerId;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1 });
  if (error || data.users.length === 0) return null;

  cachedOwnerId = data.users[0].id;
  return cachedOwnerId;
}

export async function resolveUploadActorUserId(
  request: Request,
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (token && token === process.env.API_UPLOAD_TOKEN) {
    return getOwnerUserId();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
