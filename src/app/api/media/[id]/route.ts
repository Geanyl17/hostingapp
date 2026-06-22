import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadRoot } from "@/lib/media";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select("storage_path, user_id")
    .eq("id", id)
    .single();

  if (error || !data || data.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await unlink(path.join(uploadRoot(), data.storage_path)).catch(() => {});

  const { error: deleteError } = await admin.from("media").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, string | boolean | null> = {};
  if ("captured_at" in body) updates.captured_at = typeof body.captured_at === "string" ? body.captured_at : null;
  if ("note" in body) updates.note = typeof body.note === "string" ? body.note : null;
  if ("featured" in body) updates.featured = Boolean(body.featured);
  if ("title" in body) updates.title = typeof body.title === "string" ? body.title : null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select("user_id")
    .eq("id", id)
    .single();

  if (error || !data || data.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("media")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
