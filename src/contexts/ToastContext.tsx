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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      
      {/* TOAST CONTAINER (FIXED POSITION) */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 font-mono pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
                pointer-events-auto min-w-[300px] max-w-sm flex items-start gap-3 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                animate-in slide-in-from-right fade-in duration-300
                ${toast.type === "success" ? "bg-green-300" : ""}
                ${toast.type === "error" ? "bg-red-400 text-white" : ""}
                ${toast.type === "info" ? "bg-white" : ""}
            `}
          >
            <div className="mt-1">
                {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
                {toast.type === "error" && <AlertTriangle className="w-5 h-5" />}
                {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm uppercase">{toast.type}</h4>
                <p className="text-xs leading-tight">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="hover:opacity-50">
                <X className="w-4 h-4" />
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