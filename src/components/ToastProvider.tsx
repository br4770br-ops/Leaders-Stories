import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (input: { title: string; description?: string; variant?: ToastVariant; durationMs?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({
      title,
      description,
      variant = 'info',
      durationMs = 4200,
    }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
      durationMs?: number;
    }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[90] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => {
          const Icon =
            toast.variant === 'success'
              ? CheckCircle2
              : toast.variant === 'error' || toast.variant === 'warning'
              ? AlertCircle
              : Info;
          const borderAccent =
            toast.variant === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-50'
              : toast.variant === 'error'
              ? 'border-red-500/45 bg-red-950/90 text-red-50'
              : toast.variant === 'warning'
              ? 'border-amber-500/45 bg-amber-950/90 text-amber-50'
              : 'border-white/15 bg-[#16161D]/95 text-white';

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all ${borderAccent}`}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-xs font-semibold">{toast.title}</div>
                {toast.description && (
                  <p className="text-[11px] opacity-85 leading-snug">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-current/70 hover:text-current p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      notify: () => {},
    };
  }
  return ctx;
}
