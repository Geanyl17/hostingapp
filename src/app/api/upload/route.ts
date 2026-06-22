import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUploadActorUserId } from "@/lib/auth-actor";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, buildShareFilename, buildStoragePath, uploadRoot } from "@/lib/media";

export async function POST(request: Request) {
  const userId = await resolveUploadActorUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const id = crypto.randomUUID();
  const storagePath = buildStoragePath(userId, id, ext);
  const fullPath = path.join(uploadRoot(), storagePath);

  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

  const admin = createAdminClient();
  const { error } = await admin.from("media").insert({
    id,
    user_id: userId,
    original_filename: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    size_bytes: file.size,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shareFilename = buildShareFilename(file.name, file.type);
  const url = new URL(`/f/${id}/${shareFilename}`, process.env.PUBLIC_APP_URL).toString();
  return NextResponse.json({ id, url }, { status: 201 });
}
