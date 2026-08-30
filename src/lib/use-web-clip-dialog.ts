import { useEffect, useState } from "react";

type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();
let isOpenState = false;

function setOpenState(next: boolean) {
  isOpenState = next;
  for (const listener of listeners) listener(isOpenState);
}

// Shared open/close state (not React context), same pattern as
// use-shortcuts-dialog.ts — the trigger points (command menu, sidebar)
// don't share a component ancestor closer than the app root.
export function useWebClipDialog() {
  const [isOpen, setIsOpen] = useState(isOpenState);

  useEffect(() => {
    setIsOpen(isOpenState);
    listeners.add(setIsOpen);
    return () => {
      listeners.delete(setIsOpen);
    };
  }, []);

  return {
    isOpen,
    setOpen: setOpenState,
    open: () => setOpenState(true),
    close: () => setOpenState(false),
  };
}
