type Listener = (message: string) => void;

const listeners = new Set<Listener>();

// Minimal pub/sub so data hooks (which run outside any component's render
// tree) can surface a failure without threading error state through every
// caller. Not a queue/undo system — just "something failed, tell the user."
export function notifyError(message: string) {
  for (const listener of listeners) listener(message);
}

export function subscribeToErrors(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
