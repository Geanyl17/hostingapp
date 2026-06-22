import { serveMediaFile } from "@/lib/serve-media";

const LINK_PREVIEW_BOTS = /discordbot|slackbot|telegrambot|whatsapp|facebookexternalhit|twitterbot|linkedinbot|skypeuripreview|vkshare|embedly|redditbot|pinterest/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  const { id } = await params;
  const userAgent = request.headers.get("user-agent") ?? "";

  if (!LINK_PREVIEW_BOTS.test(userAgent)) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(`/p/${id}`, process.env.PUBLIC_APP_URL).toString(),
        "Cache-Control": "private, no-store",
      },
    });
  }

  return serveMediaFile(request, id, { cacheable: false });
}
