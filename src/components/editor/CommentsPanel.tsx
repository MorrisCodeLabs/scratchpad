import { useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsPro } from "@/lib/use-plan";
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { ProBadge } from "@/components/pro/ProBadge";
import { useNoteComments } from "@/lib/data/use-note-comments";

export function CommentsPanel({
  noteId,
  workspaceId,
  currentUserId,
}: {
  noteId: string;
  workspaceId: string;
  currentUserId: string;
}) {
  const isPro = useIsPro();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { comments, addComment, deleteComment } = useNoteComments(isPro ? noteId : undefined);

  const post = async () => {
    if (!draft.trim()) return;
    await addComment(workspaceId, draft);
    setDraft("");
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Comments"
            onClick={(e) => {
              if (!isPro) {
                e.preventDefault();
                setUpgradeOpen(true);
              }
            }}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-faint hover:bg-surface-2"
          >
            <MessageSquare size={13} />
            Comments
            {comments.length > 0 && <span className="tabular-nums">({comments.length})</span>}
            {!isPro && <ProBadge />}
          </button>
        </PopoverTrigger>
        {isPro && (
          <PopoverContent align="start" className="w-72">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Comments</p>
            <div className="mb-2 flex max-h-56 flex-col gap-2 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-faint">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="group rounded-md bg-surface-2 px-2.5 py-2 text-xs text-ink">
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="font-medium text-faint">{c.created_by === currentUserId ? "You" : "Member"}</span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-faint">{new Date(c.created_at).toLocaleDateString()}</span>
                        {c.created_by === currentUserId && (
                          <button
                            type="button"
                            onClick={() => deleteComment(c.id)}
                            className="hidden text-faint hover:text-danger group-hover:block"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    post();
                  }
                }}
                placeholder="Add a comment…"
                rows={2}
                className="w-full resize-none rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-ink outline-none placeholder:text-faint"
              />
            </div>
            <div className="mt-1.5 flex justify-end">
              <Button size="sm" onClick={post} disabled={!draft.trim()}>
                Post
              </Button>
            </div>
          </PopoverContent>
        )}
      </Popover>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Comments" />
    </>
  );
}
