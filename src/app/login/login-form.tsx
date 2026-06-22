"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { login, type LoginState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      Sign in
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
