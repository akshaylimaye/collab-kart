"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = Date.now();
    setItems((current) => [...current, { ...item, id }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((toastItem) => toastItem.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {items.map((item) => {
          const Icon = item.variant === "success" ? CheckCircle2 : XCircle;
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border bg-card p-4 shadow-lg",
                item.variant === "error" ? "border-destructive/30" : "border-primary/30"
              )}
            >
              <div className="flex gap-3">
                <Icon className={cn("mt-0.5 h-5 w-5", item.variant === "error" ? "text-destructive" : "text-primary")} />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
