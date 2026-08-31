import { useEffect, useState } from "react";

export interface EditorPrefs {
  autosave: boolean;
  defaultFont: string;
}

const STORAGE_KEY = "scratchpad:editor-prefs";
const DEFAULTS: EditorPrefs = { autosave: true, defaultFont: "System UI" };

function read(): EditorPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useEditorPrefs() {
  const [prefs, setPrefs] = useState<EditorPrefs>(read);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const setAutosave = (autosave: boolean) => setPrefs((prev) => ({ ...prev, autosave }));
  const setDefaultFont = (defaultFont: string) => setPrefs((prev) => ({ ...prev, defaultFont }));

  return { ...prefs, setAutosave, setDefaultFont };
}
