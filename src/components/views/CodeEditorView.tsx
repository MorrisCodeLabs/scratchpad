import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { languages as cmLanguages } from "@codemirror/language-data";
import { LanguageDescription } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { Code2, Plus, Copy, Check, Trash2, FileCode, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useCodeFiles } from "@/lib/data/use-code-files";
import { useAutosave } from "@/lib/data/use-autosave";
import { useEffectivePlan } from "@/lib/use-plan";
import { useSession } from "@/lib/data/use-session";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { scratchpadCodeTheme } from "@/lib/code-editor-theme";
import { cn } from "@/lib/cn";
import type { CodeFile } from "@/lib/types";

const DEFAULT_LANGUAGE = "JavaScript";
const SORTED_LANGUAGES = [...cmLanguages].sort((a, b) => a.name.localeCompare(b.name));

function languageExtension(name: string): Promise<Extension> | null {
  const desc = LanguageDescription.matchLanguageName(cmLanguages, name, true);
  return desc ? desc.load() : null;
}

export function CodeEditorView() {
  const plan = useEffectivePlan();
  if (plan === "free") return <CodeEditorPaywall />;
  return <CodeEditorWorkspace />;
}

function CodeEditorPaywall() {
  const { navigate } = useWorkspaceContext();
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <CardHeader className="items-center pt-8">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
            <Code2 size={20} />
          </div>
          <CardTitle className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-accent" /> Code Editor
          </CardTitle>
          <CardDescription>
            A standalone, syntax-highlighted code editor for snippets and scratch files — separate from your notes.
            Available on Pro and Team.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pb-8">
          <Button onClick={() => navigate({ name: "settings", section: "billing" })}>Upgrade to unlock</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function CodeEditorWorkspace() {
  const { workspace, userId } = useWorkspaceContext();
  const { session } = useSession();
  const { files, loading, createFile, updateFile, deleteFile } = useCodeFiles(workspace.id);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeFile = useMemo(() => files.find((f) => f.id === activeId) ?? null, [files, activeId]);

  useEffect(() => {
    if (!loading && !activeId && files.length > 0) setActiveId(files[0].id);
  }, [loading, activeId, files]);

  const handleCreate = async () => {
    const uid = session?.user.id ?? userId;
    const name = `untitled-${files.length + 1}`;
    const file = await createFile(name, DEFAULT_LANGUAGE, uid);
    if (file) setActiveId(file.id);
  };

  const handleDelete = async (file: CodeFile) => {
    if (!confirm(`Delete "${file.name}"? This can't be undone.`)) return;
    await deleteFile(file.id);
    if (activeId === file.id) setActiveId(null);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-faint">
        <Loader2 size={18} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center justify-between px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Code2 size={15} className="text-accent" /> Code Editor
          </p>
          <button
            type="button"
            title="New file"
            onClick={handleCreate}
            className="flex h-6 w-6 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {files.length === 0 ? (
            <button
              type="button"
              onClick={handleCreate}
              className="mx-2 mt-2 flex w-[calc(100%-1rem)] flex-col items-center gap-2 rounded-lg border border-dashed border-line px-3 py-6 text-center text-[12.5px] text-faint transition-colors hover:border-accent hover:text-accent"
            >
              <FileCode size={18} />
              New file
            </button>
          ) : (
            files.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveId(f.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                  f.id === activeId ? "bg-accent-soft text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <FileCode size={13} className="shrink-0 opacity-70" />
                <span className="min-w-0 flex-1 truncate">{f.name || "untitled"}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(f);
                  }}
                  className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {activeFile ? (
          <CodeFileEditor
            key={activeFile.id}
            file={activeFile}
            onRename={(name) => updateFile(activeFile.id, { name })}
            onLanguageChange={(language) => updateFile(activeFile.id, { language })}
            onContentChange={(content) => updateFile(activeFile.id, { content })}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-faint">
            <Code2 size={28} />
            <p className="text-[13px]">Select a file, or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function CodeFileEditor({
  file,
  onRename,
  onLanguageChange,
  onContentChange,
}: {
  file: CodeFile;
  onRename: (name: string) => Promise<void>;
  onLanguageChange: (language: string) => Promise<void>;
  onContentChange: (content: string) => Promise<void>;
}) {
  const [name, setName] = useState(file.name);
  const [content, setContent] = useState(file.content);
  const [extension, setExtension] = useState<Extension | null>(null);
  const [copied, setCopied] = useState(false);

  const { saveState, saveNow } = useAutosave({
    data: content,
    onSave: onContentChange,
    delayMs: 900,
  });

  useEffect(() => {
    let cancelled = false;
    const load = languageExtension(file.language);
    if (!load) {
      setExtension(null);
      return;
    }
    load.then((ext) => {
      if (!cancelled) setExtension(ext);
    });
    return () => {
      cancelled = true;
    };
  }, [file.language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Couldn't save" : "";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== file.name && onRename(name.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-ink outline-none placeholder:text-faint"
          placeholder="untitled"
        />
        <Select value={file.language} onValueChange={(v) => onLanguageChange(v)}>
          <SelectTrigger className="h-7 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTED_LANGUAGES.map((l) => (
              <SelectItem key={l.name} value={l.name}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          title="Copy"
          onClick={handleCopy}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {copied ? <Check size={14} className="text-good" /> : <Copy size={14} />}
        </button>
        <span className="w-16 shrink-0 text-right text-[11px] text-faint">{saveLabel}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") saveNow();
      }}>
        <CodeMirror
          value={content}
          height="100%"
          theme={scratchpadCodeTheme}
          extensions={extension ? [extension] : []}
          onChange={(value) => setContent(value)}
          basicSetup={{ closeBrackets: true, autocompletion: true, foldGutter: true }}
        />
      </div>
    </div>
  );
}
