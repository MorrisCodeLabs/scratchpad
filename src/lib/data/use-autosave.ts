import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveState } from "@/lib/types";
import { queueOfflineSave, clearOfflineSave } from "@/lib/data/offline-queue";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delayMs?: number;
  enabled?: boolean;
  /** When set, a save attempted while offline is mirrored to localStorage under this key instead of failing outright, and retried automatically once the browser reports it's back online. */
  offlineKey?: string;
}

// Debounced autosave with an explicit manual-save escape hatch. `saveNow`
// flushes any pending debounce immediately, so a Cmd+S keystroke or a
// "Save" button never has to wait out the timer.
export function useAutosave<T>({ data, onSave, delayMs = 1200, enabled = true, offlineKey }: UseAutosaveOptions<T>) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef(data);
  const isFirstRun = useRef(true);

  latestData.current = data;

  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (offlineKey && typeof navigator !== "undefined" && !navigator.onLine) {
      queueOfflineSave(offlineKey, latestData.current);
      setSaveState("offline");
      return;
    }
    setSaveState("saving");
    try {
      await onSave(latestData.current);
      if (offlineKey) clearOfflineSave(offlineKey);
      setSaveState("saved");
    } catch (err) {
      if (offlineKey && typeof navigator !== "undefined" && !navigator.onLine) {
        queueOfflineSave(offlineKey, latestData.current);
        setSaveState("offline");
        return;
      }
      console.error(err);
      setSaveState("error");
    }
  }, [onSave, offlineKey]);

  useEffect(() => {
    if (!enabled) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      flush();
    }, delayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled, delayMs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        flush();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flush]);

  // The moment connectivity returns, retry a queued save immediately
  // instead of waiting for the next edit to re-arm the debounce timer.
  useEffect(() => {
    if (!offlineKey) return;
    const onOnline = () => {
      setSaveState((prev) => (prev === "offline" ? "saving" : prev));
      flush();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [offlineKey, flush]);

  return { saveState, saveNow: flush };
}
