/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove dalam 3 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto min-w-[280px] max-w-sm flex items-start gap-3 px-4 py-3 rounded-lg border font-sans text-sm",
              "animate-in slide-in-from-right fade-in duration-200",
              toast.type === "success" ? "bg-surface border-ok/30" : "",
              toast.type === "error" ? "bg-surface border-err/30" : "",
              toast.type === "info" ? "bg-surface border-dim" : "",
            ].join(" ")}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && (
                <CheckCircle className="w-4 h-4 text-ok" strokeWidth={1.5} />
              )}
              {toast.type === "error" && (
                <AlertTriangle className="w-4 h-4 text-err" strokeWidth={1.5} />
              )}
              {toast.type === "info" && (
                <Info className="w-4 h-4 text-accent" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs leading-relaxed text-hi">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-lo hover:text-hi transition-colors shrink-0 mt-0.5"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
