import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'Something unexpected went wrong.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; path?: string };
      if (parsed.error) {
        readable = `${parsed.error}${parsed.path ? ` (${parsed.path})` : ''}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-[#0A0A0D] text-white flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#141419] border border-white/10 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#E5233D]/15 text-[#E5233D] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-display text-lg font-bold">Unable to Load Story Data</h2>
            <p className="text-sm text-zinc-400 break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5233D] hover:bg-[#cc1e35] px-5 py-2.5 text-sm font-semibold text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
