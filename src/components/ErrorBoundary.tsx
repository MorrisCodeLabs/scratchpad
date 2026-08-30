import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Without this, an uncaught render error anywhere below unmounts the whole
// React tree and leaves a blank page with no indication anything went
// wrong. This catches it, shows a recoverable message instead, and resets
// on the next navigation (key-based remount) rather than staying stuck.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Scratchpad crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <AlertTriangle size={22} className="text-danger" />
          <p className="text-sm font-medium text-ink">Something went wrong displaying this.</p>
          <p className="max-w-sm text-xs text-faint">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
