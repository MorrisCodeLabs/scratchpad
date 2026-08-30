// Opens a native file picker without any UI of our own, resolving with the
// chosen file (or null if the user cancels). No React state needed since
// this is a one-shot side effect triggered from a slash-menu command.
export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";

    const cleanup = () => {
      input.remove();
      window.removeEventListener("focus", onFocus);
    };

    // If the picker is dismissed with no file chosen, `change` never fires —
    // catch that via the window regaining focus on close.
    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) {
          cleanup();
          resolve(null);
        }
      }, 300);
    };

    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0] ?? null;
        cleanup();
        resolve(file);
      },
      { once: true },
    );

    window.addEventListener("focus", onFocus, { once: true });
    document.body.appendChild(input);
    input.click();
  });
}
