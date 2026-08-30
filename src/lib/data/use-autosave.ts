import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveState } from "@/lib/types";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delayMs?: number;
  enabled?: boolean;
}

// Debounced autosave with an explicit manual-save escape hatch. `saveNow`
// flushes any pending debounce immediately, so a Cmd+S keystroke or a
// "Save" button never has to wait out the timer.
export function useAutosave<T>({ data, onSave, delayMs = 1200, enabled = true }: UseAutosaveOptions<T>) {
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
    setSaveState("saving");
    try {
      await onSave(latestData.current);
      setSaveState("saved");
    } catch (err) {
      console.error(err);
      setSaveState("error");
    }
  }, [onSave]);

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

  return { saveState, saveNow: flush };
}
