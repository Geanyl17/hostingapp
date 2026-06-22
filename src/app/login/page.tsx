import { ImageIcon } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <ImageIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Sign in
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
