import { useCallback, useEffect, useEffectEvent, useState } from "react";

export const LIVE_POLL_MS = 10_000;

export interface PolledData<T> {
  data: T | null;
  /** True until data for the current key arrives (initial load, filter change or retry). */
  isLoading: boolean;
  /** Error from the latest request. `data` keeps the last good payload if there was one. */
  error: Error | null;
  /** When `data` was last refreshed. */
  lastUpdated: Date | null;
  /** Retry from scratch: shows the loading state until the new response arrives. */
  refetch: () => void;
  /** Refetch now in the background (e.g. after a mutation); current data stays on screen. */
  refresh: () => void;
}

interface Options {
  /** Changing the key (e.g. serialized filters) refetches and shows the loading state. */
  key?: string;
  /** Poll interval in ms, or null to fetch once. */
  intervalMs?: number | null;
}

/** Fetches data through the service layer, optionally polling so live views stay current. */
export function usePolledData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  { key = "", intervalMs = LIVE_POLL_MS }: Options = {},
): PolledData<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const requestKey = `${key}#${reloadCount}`;

  // Results are tagged with the key they were fetched for, so a new key reads as
  // "loading" straight away without resetting state inside the effect.
  const [result, setResult] = useState<{ key: string; data: T; at: Date } | null>(null);
  const [failure, setFailure] = useState<{ key: string; error: Error } | null>(null);

  const runFetcher = useEffectEvent((signal: AbortSignal) => fetcher(signal));

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const data = await runFetcher(controller.signal);
        if (controller.signal.aborted) return;
        setResult({ key: requestKey, data, at: new Date() });
        setFailure(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setFailure({ key: requestKey, error: err instanceof Error ? err : new Error("Failed to load data.") });
      }
      if (intervalMs !== null) timer = setTimeout(load, intervalMs);
    };

    void load();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // refreshCount restarts the poll loop with an immediate fetch, keeping the same key.
  }, [requestKey, intervalMs, refreshCount]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const data = result?.key === requestKey ? result.data : null;
  const error = failure?.key === requestKey ? failure.error : null;

  return {
    data,
    isLoading: data === null && error === null,
    error,
    lastUpdated: data === null ? null : result!.at,
    refetch,
    refresh,
  };
}
