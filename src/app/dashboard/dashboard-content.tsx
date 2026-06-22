"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { MediaItem } from "@/lib/get-media";
import type { Collection } from "@/lib/collections";
import { Uploader } from "./uploader";
import { Gallery } from "./gallery";

const ALL = "all";
const UNSORTED = "unsorted";

export function DashboardContent({
  items,
  collections,
}: {
  items: MediaItem[];
  collections: Collection[];
}) {
  const router = useRouter();
  const [activeFolder, setActiveFolder] = useState<string>(ALL);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeFolder === ALL) return items;
    if (activeFolder === UNSORTED) return items.filter((item) => !item.collection_id);
    return items.filter((item) => item.collection_id === activeFolder);
  }, [items, activeFolder]);

  async function createFolder() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) {
      setNewName("");
      setCreating(false);
      router.refresh();
    }
  }

  async function deleteFolder(id: string) {
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (activeFolder === id) setActiveFolder(ALL);
      router.refresh();
    }
  }

  return (
    <>
      <Uploader />
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFolder(ALL)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeFolder === ALL
              ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
              : "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFolder(UNSORTED)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeFolder === UNSORTED
              ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
              : "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          }`}
        >
          Unsorted
        </button>
        {collections.map((collection) => (
          <div key={collection.id} className="group relative">
            <button
              onClick={() => setActiveFolder(collection.id)}
              className={`rounded-lg border px-3 py-1.5 pr-7 text-sm font-medium transition-colors ${
                activeFolder === collection.id
                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {collection.name}
            </button>
            <button
              onClick={() => deleteFolder(collection.id)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              title="Delete folder"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {creating ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              placeholder="Folder name"
              className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              onClick={createFolder}
              disabled={saving}
              className="rounded-lg bg-zinc-950 px-2 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
            >
              Add
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <Plus className="h-3.5 w-3.5" />
            New folder
          </button>
        )}
      </div>
      <Gallery items={filteredItems} collections={collections} />
    </>
  );
}
