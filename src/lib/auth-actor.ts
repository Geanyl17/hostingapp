import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

let cachedOwnerId: string | null = null;

function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

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

  const expectedToken = process.env.API_UPLOAD_TOKEN;
  if (token && expectedToken && tokensMatch(token, expectedToken)) {
    return getOwnerUserId();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
