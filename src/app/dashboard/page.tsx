import { LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Uploads and gallery coming soon.
        </p>
      </main>
    </div>
  );
}
