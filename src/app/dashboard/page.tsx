import { LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMediaForUser } from "@/lib/get-media";
import { getCollectionsForUser } from "@/lib/collections";
import { LogoutButton } from "./logout-button";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const items = user ? await getMediaForUser(user.id) : [];
  const collections = user ? await getCollectionsForUser(user.id) : [];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <DashboardContent items={items} collections={collections} />
      </main>
    </div>
  );
}
