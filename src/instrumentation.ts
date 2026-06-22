export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { cleanupExpiredMedia } = await import("@/lib/cleanup");
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

  const runCleanup = async () => {
    try {
      const deleted = await cleanupExpiredMedia();
      if (deleted > 0) console.log(`Cleanup: removed ${deleted} expired media item(s)`);
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  runCleanup();
  setInterval(runCleanup, SIX_HOURS_MS);
}
