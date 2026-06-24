"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
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
  searchable?: boolean;
  "aria-label"?: string;
}

type SelectPosition = {
  left: number;
  top: number;
  width: number;
};

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
  searchable,
  "aria-label": ariaLabel
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [position, setPosition] = React.useState<SelectPosition | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const selected = options.find((option) => option.value === value);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const listboxId = id ? id + "-listbox" : "select-listbox";
  const hasSearch = searchable ?? options.length > 8;
  const filteredOptions = query.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function setRefs(node: HTMLButtonElement | null) {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const width = rect.width;
    const left = Math.min(Math.max(viewportPadding, rect.left), Math.max(viewportPadding, window.innerWidth - width - viewportPadding));
    const estimatedHeight = Math.min(320, 72 + filteredOptions.length * 42);
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove = spaceBelow < Math.min(260, estimatedHeight) && rect.top > spaceBelow;
    const top = shouldOpenAbove ? Math.max(viewportPadding, rect.top - estimatedHeight - 8) : Math.min(window.innerHeight - viewportPadding, rect.bottom + 8);
    setPosition({ left, top, width });
  }, [filteredOptions.length]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
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
    setQuery("");
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
      const next = Math.min(filteredOptions.length - 1, index + 1);
      document.getElementById(listboxId + "-option-" + next)?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, index - 1);
      document.getElementById(listboxId + "-option-" + next)?.focus();
    }
  }

  React.useEffect(() => {
    if (!open || hasSearch) return;
    window.requestAnimationFrame(() => document.getElementById(listboxId + "-option-" + selectedIndex)?.focus());
  }, [hasSearch, listboxId, open, selectedIndex]);

  const content = open && position ? createPortal(
    <div
      ref={panelRef}
      className={cn("fixed z-[9999] overflow-hidden rounded-xl border border-border bg-white shadow-xl ring-1 ring-black/5", contentClassName)}
      style={{ left: position.left, top: position.top, width: position.width }}
    >
      {hasSearch ? (
        <div className="border-b border-border/70 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search options"
              autoFocus
            />
          </div>
        </div>
      ) : null}
      <div id={listboxId} role="listbox" aria-label={ariaLabel || placeholder} className="max-h-[260px] overflow-y-auto py-1">
        {filteredOptions.length === 0 ? <p className="px-4 py-3 text-sm text-muted-foreground">No options found</p> : null}
        {filteredOptions.map((option, index) => (
          <button
            key={option.value}
            id={listboxId + "-option-" + index}
            type="button"
            role="option"
            aria-selected={value === option.value}
            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary/70 focus:bg-secondary/70 focus:outline-none data-[selected=true]:font-semibold data-[selected=true]:text-primary"
            data-selected={value === option.value}
            onClick={() => selectValue(option.value)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
          >
            <span className="truncate">{option.label}</span>
            {value === option.value ? <Check className="h-4 w-4 shrink-0" /> : null}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        ref={setRefs}
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
      {content}
    </div>
  );
});
Select.displayName = "Select";

export { Select };
