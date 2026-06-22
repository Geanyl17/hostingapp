"use client";

import { useState } from "react";
import { Link2, Check, Film } from "lucide-react";
import type { MediaItem } from "@/lib/get-media";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function GalleryCard({ item }: { item: MediaItem }) {
  const [copied, setCopied] = useState(false);
  const isVideo = item.mime_type.startsWith("video/");
  const fileUrl = `/f/${item.id}`;

  async function copyLink() {
    const fullUrl = new URL(fileUrl, window.location.origin).toString();
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {isVideo ? (
          <Film className="h-8 w-8 text-zinc-400" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={item.original_filename}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {item.original_filename}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatSize(item.size_bytes)}
          </span>
        </div>
        <button
          onClick={copyLink}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export function Gallery({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No uploads yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
