export function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// PDF export goes through the browser's native print-to-PDF rather than a
// client-side PDF library — no extra ~1MB dependency, and it inherits the
// editor's own rendering (fonts, tables, images) instead of a re-implementation
// of it. Opens a print-only window with the note's rendered HTML.
export function printNoteAsPdf(title: string, bodyHtml: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #1a1e22; line-height: 1.6; }
          h1 { font-size: 1.8rem; }
          img { max-width: 100%; }
          pre { background: #f1f1f1; padding: 0.75rem 1rem; border-radius: 6px; overflow-x: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 0.4rem 0.6rem; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${bodyHtml}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
