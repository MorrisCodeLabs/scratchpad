import { Bug, Check, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBugReports } from "@/lib/data/use-bug-reports";
import { useIsOwnerAccount } from "@/lib/use-plan";

export function BugReportsView() {
  const isOwner = useIsOwnerAccount();
  const { reports, loading, resolveReport } = useBugReports();

  if (!isOwner) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-faint">
        This page is only visible to the app owner.
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6 sm:px-10 sm:py-10">
      <h1 className="mb-1 flex items-center gap-2 text-[1.7rem] font-bold tracking-tight text-ink">
        <Bug size={24} className="text-accent" /> Bugs reported
      </h1>
      <p className="mb-8 text-sm text-faint">Submissions from the beta banner's "Report a bug" form, across every workspace.</p>

      {loading ? (
        <p className="text-[13px] text-faint">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-[13px] text-faint">No bug reports yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">{r.title}</h2>
                <Badge variant={r.status === "open" ? "warn" : "good"}>{r.status === "open" ? "Open" : "Resolved"}</Badge>
              </div>
              <p className="mb-3 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">{r.description}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
                <span>{r.reported_by_email ?? "Unknown user"}</span>
                <span>·</span>
                <span>{new Date(r.created_at).toLocaleString()}</span>
                {r.page_path && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{r.page_path}</span>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 px-2 text-[11px]"
                  onClick={() => resolveReport(r.id, r.status === "open" ? "resolved" : "open")}
                >
                  {r.status === "open" ? (
                    <>
                      <Check size={11} /> Mark resolved
                    </>
                  ) : (
                    <>
                      <Undo2 size={11} /> Reopen
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
