import { useEffect, useState } from "react";

type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();
let isOpenState = false;

function setOpenState(next: boolean) {
  isOpenState = next;
  for (const listener of listeners) listener(isOpenState);
}

// Shared open/close state (not React context) because the trigger points —
// a Settings row, the "?" hotkey, the command menu — don't share a common
// component ancestor closer than the app root, and this is simpler than
// threading a dialog-open prop through all of them.
export function useShortcutsDialog() {
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
