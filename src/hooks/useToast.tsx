import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastItem } from '../types';
import { cn } from '../lib/utils';

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {}, dismiss: () => {} });

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const STYLES = {
  success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-500/30 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
  warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200',
  info: 'border-sky-500/30 bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-200',
} as const;

const ICON_STYLES = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-sky-500',
} as const;

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = ICONS[item.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-lg min-w-[280px] max-w-sm',
        STYLES[item.type]
      )}
    >
      <Icon size={18} className={cn('mt-0.5 flex-shrink-0', ICON_STYLES[item.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{item.title}</p>
        {item.message && <p className="text-xs mt-0.5 opacity-75">{item.message}</p>}
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: ToastItem = { ...item, id };
    setToasts(prev => [...prev.slice(-4), newToast]);
    setTimeout(() => dismiss(id), item.duration ?? 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
