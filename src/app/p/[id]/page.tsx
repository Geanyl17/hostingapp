import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, FileText, HardDrive, Clock } from "lucide-react";
import { getMediaById } from "@/lib/get-media";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const item = await getMediaById(id);
  if (!item) return {};

  const fileUrl = new URL(`/f/${id}`, process.env.PUBLIC_APP_URL).toString();
  const isVideo = item.mime_type.startsWith("video/");

  return {
    title: item.original_filename,
    openGraph: isVideo
      ? {
          title: item.original_filename,
          videos: [{ url: fileUrl, type: item.mime_type }],
        }
      : {
          title: item.original_filename,
          images: [{ url: fileUrl }],
        },
  };
}

export default async function MediaPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await getMediaById(id);
  if (!item) notFound();

  const fileUrl = `/f/${id}`;
  const isVideo = item.mime_type.startsWith("video/");

  return (
    <div className="flex flex-1 flex-col gap-6 bg-zinc-50 p-6 md:flex-row dark:bg-black">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
        {isVideo ? (
          <video src={fileUrl} controls className="max-h-[80vh] w-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={item.original_filename}
            className="max-h-[80vh] w-full object-contain"
          />
        )}
      </div>
      <div className="flex w-full flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:w-72 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {item.original_filename}
        </h1>
        <div className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">Taken</div>
              <div>{formatDate(item.captured_at)}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">Uploaded</div>
              <div>{formatDate(item.created_at)}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HardDrive className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">Size</div>
              <div>{formatSize(item.size_bytes)}</div>
            </div>
          </div>
          {item.note && (
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">Note</div>
                <div className="whitespace-pre-wrap">{item.note}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
