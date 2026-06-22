import "server-only";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadRoot } from "@/lib/media";

export async function serveMediaFile(request: Request, id: string): Promise<Response> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("media")
    .select("storage_path, mime_type, original_filename")
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  const fullPath = path.join(uploadRoot(), data.storage_path);
  const stats = await stat(fullPath).catch(() => null);
  if (!stats) {
    return new Response("Not found", { status: 404 });
  }

  const range = request.headers.get("range");
  const headers = new Headers({
    "Content-Type": data.mime_type,
    "Content-Disposition": `inline; filename="${data.original_filename}"`,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  });

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : stats.size - 1;

    headers.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    headers.set("Content-Length", String(end - start + 1));

    const stream = createReadStream(fullPath, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers,
    });
  }

  headers.set("Content-Length", String(stats.size));
  const stream = createReadStream(fullPath);
  return new Response(Readable.toWeb(stream) as ReadableStream, { headers });
}
