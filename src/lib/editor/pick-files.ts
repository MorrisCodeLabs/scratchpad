// Same pattern as pick-file.ts, but supports selecting multiple files at
// once (used for bulk note import).
export function pickFiles(accept: string): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = true;
    input.style.display = "none";

    const cleanup = () => {
      input.remove();
      window.removeEventListener("focus", onFocus);
    };

    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) {
          cleanup();
          resolve([]);
        }
      }, 300);
    };

    input.addEventListener(
      "change",
      () => {
        const files = input.files ? Array.from(input.files) : [];
        cleanup();
        resolve(files);
      },
      { once: true },
    );

    window.addEventListener("focus", onFocus, { once: true });
    document.body.appendChild(input);
    input.click();
  });
}
