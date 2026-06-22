import Link from "next/link";
import { Play, LogIn, LayoutDashboard } from "lucide-react";
import { getFeaturedMedia } from "@/lib/get-media";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const items = await getFeaturedMedia();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Geanyl Dev Tools
        </span>
        {user ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </Link>
        )}
      </header>

      <section className="flex flex-col items-center gap-3 px-6 pt-16 pb-10 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Welcome to Geanyl&apos;s Hosting Site.
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          uploads are currently private, but you can view some of the featured media below!
        </p>
      </section>

      <main className="flex flex-1 flex-col px-6 pb-16 sm:px-10">
        {items.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Nothing featured yet.
          </p>
        ) : (
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => {
              const isVideo = item.mime_type.startsWith("video/");
              return (
                <Link
                  key={item.id}
                  href={`/p/${item.id}`}
                  className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
                >
                  {isVideo ? (
                    <video
                      src={`/f/${item.id}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      muted
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/f/${item.id}`}
                      alt={item.original_filename}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                        <Play className="h-4 w-4 fill-current text-zinc-900" />
                      </div>
                    </div>
                  )}
                  {item.title && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                      <span className="truncate text-sm font-medium text-white">
                        {item.title}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
