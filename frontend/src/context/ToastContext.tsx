import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertToast } from '../components/ui/alert-toast';

export type ToastVariant = 'success' | 'warning' | 'info' | 'error';
export type ToastStyleVariant = 'default' | 'filled';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  styleVariant?: ToastStyleVariant;
  duration?: number;
}

interface ToastContextType {
  toast: {
    (item: Omit<ToastItem, 'id'>): void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...item, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = item.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastMethods = Object.assign(
    (item: Omit<ToastItem, 'id'>) => addToast(item),
    {
      success: (title: string, description?: string) =>
        addToast({ title, description, variant: 'success', styleVariant: 'default' }),
      error: (title: string, description?: string) =>
        addToast({ title, description, variant: 'error', styleVariant: 'default' }),
      warning: (title: string, description?: string) =>
        addToast({ title, description, variant: 'warning', styleVariant: 'default' }),
      info: (title: string, description?: string) =>
        addToast({ title, description, variant: 'info', styleVariant: 'default' }),
    }
  );

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <AlertToast
                title={t.title}
                description={t.description}
                variant={t.variant ?? 'info'}
                styleVariant={t.styleVariant ?? 'default'}
                onClose={() => removeToast(t.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

