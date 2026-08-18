import { CheckCircle2, AlertCircle, Flame, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        let borderStyle = 'border-emerald-500/30 bg-[#0f141a]/95';

        if (toast.type === 'horror') {
          icon = <Flame className="w-5 h-5 text-red-500 shrink-0" />;
          borderStyle = 'border-red-600/40 bg-[#160b0e]/95 shadow-[0_0_20px_rgba(220,38,38,0.25)]';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderStyle = 'border-amber-500/30 bg-[#17120a]/95';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
          borderStyle = 'border-cyan-500/30 bg-[#0c141d]/95';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 text-right transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${borderStyle}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-tight">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              id={`toast-dismiss-${toast.id}`}
              onClick={() => onDismiss(toast.id)}
              className="text-neutral-400 hover:text-white transition-colors p-1 rounded"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
