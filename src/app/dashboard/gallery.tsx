"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Check, Film, Trash2, Pencil, Save, X, Star } from "lucide-react";
import type { MediaItem } from "@/lib/get-media";
import type { Collection } from "@/lib/collections";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toDatetimeLocalValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

function buildShareFilename(originalFilename: string, mimeType: string) {
  const ext = EXT_BY_MIME[mimeType] ?? "";
  const base = originalFilename.replace(/\.[^./]+$/, "");
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "file"}${ext}`;
}

function GalleryCard({ item, collections }: { item: MediaItem; collections: Collection[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [capturedAt, setCapturedAt] = useState(toDatetimeLocalValue(item.captured_at));
  const [note, setNote] = useState(item.note ?? "");
  const [title, setTitle] = useState(item.title ?? "");
  const [collectionId, setCollectionId] = useState(item.collection_id ?? "");
  const [featured, setFeatured] = useState(item.featured);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const isVideo = item.mime_type.startsWith("video/");
  const fileUrl = `/f/${item.id}`;
  const pageUrl = `/p/${item.id}`;
  const shareUrl = `/f/${item.id}/${buildShareFilename(item.original_filename, item.mime_type)}`;

  async function copyLink() {
    const fullUrl = new URL(shareUrl, window.location.origin).toString();
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function deleteItem() {
    setDeleting(true);
    const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  async function toggleFeatured() {
    setTogglingFeatured(true);
    const next = !featured;
    const res = await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: next }),
    });
    setTogglingFeatured(false);
    if (res.ok) setFeatured(next);
  }

  async function saveDetails() {
    setSaving(true);
    const res = await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        captured_at: capturedAt ? new Date(capturedAt).toISOString() : null,
        note: note || null,
        title: title || null,
        collection_id: collectionId || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <a
        href={pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
      >
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
      </a>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {item.title || item.original_filename}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatSize(item.size_bytes)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={toggleFeatured}
            disabled={togglingFeatured}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
              featured
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/70"
                : "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${featured ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => setEditing((value) => !value)}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {confirmingDelete ? (
            <button
              onClick={deleteItem}
              disabled={deleting}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
            >
              {deleting ? "Deleting..." : "Confirm"}
            </button>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              onBlur={() => setConfirmingDelete(false)}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {editing && (
        <div className="flex flex-col gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={item.original_filename}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Folder
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">No folder</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Taken
            <input
              type="datetime-local"
              value={capturedAt}
              onChange={(e) => setCapturedAt(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <div className="flex justify-end gap-1">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={saveDetails}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-zinc-950 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Gallery({
  items,
  collections,
}: {
  items: MediaItem[];
  collections: Collection[];
}) {
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
        <GalleryCard key={item.id} item={item} collections={collections} />
      ))}
    </div>
  );
}
