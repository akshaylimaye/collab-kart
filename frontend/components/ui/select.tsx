"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

export interface SelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(({
  id,
  value,
  options,
  onValueChange,
  placeholder = "Select option",
  className,
  triggerClassName,
  contentClassName,
  disabled,
  "aria-label": ariaLabel
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const listboxId = id ? id + "-listbox" : "select-listbox";

  React.useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function selectValue(nextValue: string) {
    onValueChange(nextValue);
    setOpen(false);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onOptionKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(options.length - 1, index + 1);
      document.getElementById(listboxId + "-option-" + next)?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, index - 1);
      document.getElementById(listboxId + "-option-" + next)?.focus();
    }
  }

  React.useEffect(() => {
    if (!open) return;
    window.requestAnimationFrame(() => document.getElementById(listboxId + "-option-" + selectedIndex)?.focus());
  }, [listboxId, open, selectedIndex]);

  return (
    <div ref={containerRef} className={cn("relative w-full", open ? "z-[120]" : "z-20", className)}>
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          "flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-input/90 bg-white/85 px-4 text-left text-sm shadow-sm ring-offset-background transition-colors hover:border-primary/30 focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={cn("min-w-0 truncate", selected ? "text-foreground" : "text-muted-foreground")}>{selected?.label || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className={cn("absolute left-0 top-full z-[130] mt-2 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xl ring-1 ring-black/5", contentClassName)}>
          <div id={listboxId} role="listbox" aria-label={ariaLabel || placeholder} className="max-h-72 overflow-y-auto py-1">
            {options.map((option, index) => (
              <button
                key={option.value}
                id={listboxId + "-option-" + index}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary/70 focus:bg-secondary/70 focus:outline-none data-[selected=true]:font-semibold data-[selected=true]:text-primary"
                data-selected={value === option.value}
                onClick={() => selectValue(option.value)}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
              >
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
Select.displayName = "Select";

export { Select };
