/** Serialize saves and retain the latest edit until the service acknowledges it. */
export function createSharedSaveQueue<T>(
  save: (state: T) => Promise<T | void>,
  status: (message: string) => void,
  shouldRetry: (error: unknown) => boolean = () => true,
  rebasePending?: (savedRequest: T, pending: T, committed: T) => T
) {
  let pending: { state: T } | undefined;
  let saving = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const waiting = () => pending;
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
      const committed = await save(next.state);
      const queued = waiting();
      if (queued && committed !== undefined && rebasePending) {
        queued.state = rebasePending(next.state, queued.state, committed);
      }
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
