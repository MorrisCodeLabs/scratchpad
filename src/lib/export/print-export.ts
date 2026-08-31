function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export interface PrintLayoutOptions {
  pageSize: "letter" | "a4" | "legal";
  titlePage: boolean;
  pageNumbers: boolean;
  columns: 1 | 2;
}

export const DEFAULT_PRINT_LAYOUT: PrintLayoutOptions = {
  pageSize: "letter",
  titlePage: true,
  pageNumbers: true,
  columns: 1,
};

// PDF export goes through the browser's native print-to-PDF rather than a
// client-side PDF library — no extra dependency, and it inherits the
// editor's own rendering (fonts, tables, images) instead of reimplementing
// it. Opens a print-only window with the note's rendered HTML; "Advanced
// print layouts" is the set of options below (page size, title page,
// numbering, columns) applied as print CSS before the browser dialog opens.
export function printNoteAsPdf(
  title: string,
  bodyHtml: string,
  options: { workspaceName?: string } = {},
  layout: PrintLayoutOptions = DEFAULT_PRINT_LAYOUT,
) {
  const win = window.open("", "_blank");
  if (!win) return;
  const generatedAt = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const pageSize = { letter: "letter", a4: "a4", legal: "legal" }[layout.pageSize];

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: ${pageSize}; margin: 20mm 18mm; ${layout.pageNumbers ? '@bottom-center { content: counter(page) " / " counter(pages); }' : ""} }
          * { box-sizing: border-box; }
          body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 720px; margin: 0 auto; color: #1a1e22; line-height: 1.6; }
          .sp-cover { min-height: 220mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
          .sp-cover .eyebrow { font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin: 0 0 0.75rem; }
          .sp-cover h1 { font-size: 2.4rem; line-height: 1.15; margin: 0 0 0.75rem; }
          .sp-cover .meta { font-size: 0.85rem; color: #6b7280; }
          h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
          table, pre, blockquote, img { page-break-inside: avoid; }
          p, li { orphans: 3; widows: 3; }
          img { max-width: 100%; }
          pre { background: #f1f1f1; padding: 0.75rem 1rem; border-radius: 6px; overflow-x: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 0.4rem 0.6rem; }
          .sp-body { ${layout.columns === 2 ? "column-count: 2; column-gap: 2.5rem;" : ""} }
        </style>
      </head>
      <body>
        ${
          layout.titlePage
            ? `<div class="sp-cover">
          ${options.workspaceName ? `<p class="eyebrow">${escapeHtml(options.workspaceName)}</p>` : ""}
          <h1>${escapeHtml(title)}</h1>
          <p class="meta">Generated ${generatedAt}</p>
        </div>`
            : `<h1>${escapeHtml(title)}</h1>`
        }
        <div class="sp-body">${bodyHtml}</div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}
