import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { subscribeToErrors } from "@/lib/toast";

interface ToastItem {
  id: number;
  message: string;
}

let nextId = 1;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToErrors((message) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-lg"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 text-faint hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
