/** Serialize saves and retain the latest edit until the service acknowledges it. */
export function createSharedSaveQueue<T>(save: (state: T) => Promise<void>, status: (message: string) => void, shouldRetry: (error: unknown) => boolean = () => true) {
  let pending: { state: T } | undefined;
  let saving = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = (delay: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => void flush(), delay);
  };
  const flush = async () => {
    if (saving || !pending) return;
    const next = pending;
    pending = undefined;
    saving = true;
    let failed = false;
    try {
      await save(next.state);
      status(pending ? "Saving changes to the TV service…" : "");
    } catch (error) {
      if (!shouldRetry(error)) { pending = undefined; return; }
      pending ??= next;
      failed = true;
      status("Changes are saved on this computer, but have not reached the TV service. Retrying…");
    } finally {
      saving = false;
      if (pending) schedule(failed ? 5000 : 0);
    }
  };
  return (state: T, immediate = false) => {
    pending = { state };
    status("Saving changes to the TV service…");
    schedule(immediate ? 0 : 450);
  };
}
