import { serveMediaFile } from "@/lib/serve-media";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  const { id } = await params;
  return serveMediaFile(request, id);
}
