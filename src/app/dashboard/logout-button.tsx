"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
