import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useStore } from "../lib/store";

/* ---------------- Button ---------------- */

type BtnVariant = "primary" | "dark" | "outline" | "ghost" | "danger" | "line";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none select-none";
  const sizes = {
    sm: "text-[13px] px-3.5 h-9",
    md: "text-sm px-5 h-11",
    lg: "text-[15px] px-7 h-[52px]",
  };
  const variants: Record<BtnVariant, string> = {
    primary:
      "ember-gradient text-white shadow-[0_8px_20px_-8px_rgba(234,88,12,0.7)] hover:shadow-[0_12px_28px_-8px_rgba(234,88,12,0.85)] hover:brightness-105",
    dark: "bg-ink text-paper hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white",
    outline:
      "border border-stone-300 dark:border-stone-700 text-ink dark:text-stone-100 hover:border-ember-500 hover:text-ember-600 dark:hover:text-ember-400 bg-transparent",
    ghost: "text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
    line: "border border-stone-700 text-stone-200 hover:border-ember-500 hover:text-ember-400 bg-transparent",
  };
  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className={cn(base, sizes[size], variants[variant], className)}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
}

/* ---------------- Badge ---------------- */

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "ember" | "green" | "red" | "amber" | "dark";
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    ember: "bg-ember-100 text-ember-700 dark:bg-ember-950 dark:text-ember-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
    dark: "bg-ink text-paper dark:bg-stone-100 dark:text-ink",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

/* ---------------- Switch ---------------- */

export function Switch({
  checked,
  onChange,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const dims = size === "md" ? { track: "w-12 h-7", knob: "w-5 h-5", x: 20 } : { track: "w-9 h-5", knob: "w-3.5 h-3.5", x: 16 };
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label || "toggle"}
      onClick={onChange}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-300 shrink-0",
        dims.track,
        checked ? "ember-gradient" : "bg-stone-300 dark:bg-stone-700",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        className={cn("absolute left-1 rounded-full bg-white shadow", dims.knob)}
        style={{ x: checked ? dims.x : 0 }}
      />
    </button>
  );
}

/* ---------------- Modal (glass, as specced) ---------------- */

export function Modal({
  open,
  onClose,
  children,
  wide,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative w-full max-h-[92vh] overflow-y-auto slim-scroll rounded-t-2xl sm:rounded-2xl",
              "bg-white/85 dark:bg-stone-900/85 backdrop-blur-md shadow-lift border border-white/40 dark:border-stone-700/50",
              wide ? "sm:max-w-3xl" : "sm:max-w-lg",
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ---------------- Drawer ---------------- */

export function Drawer({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-l border-stone-200 dark:border-stone-700/60 shadow-lift flex flex-col"
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ---------------- Form primitives ---------------- */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full h-11 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 text-sm text-ink dark:text-stone-100 placeholder:text-stone-400 focus:border-ember-500 focus:ring-2 focus:ring-ember-500/25 transition-shadow outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "h-auto py-2.5 min-h-[88px]", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "appearance-none pr-8", props.className)} />;
}

/* ---------------- Segmented control ---------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const segId = useId();
  return (
    <div className={cn("flex rounded-lg bg-stone-200/70 dark:bg-stone-800 p-1 gap-1", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative flex-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors",
            value === o.value ? "text-ink dark:text-white" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={segId} className="absolute inset-0 rounded-md bg-white dark:bg-stone-600/80 shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-stone-200/80 dark:bg-stone-800", className)} />;
}

/* ---------------- Sparkline ---------------- */

export function Sparkline({
  data,
  className,
  stroke = "var(--color-ember-500)",
}: {
  data: number[];
  className?: string;
  stroke?: string;
}) {
  const w = 96;
  const h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 3 - ((v - min) / (max - min || 1)) * (h - 6)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle
        cx={w}
        cy={h - 3 - ((data[data.length - 1] - min) / (max - min || 1)) * (h - 6)}
        r="2.6"
        fill={stroke}
      />
    </svg>
  );
}

/* ---------------- Empty state ---------------- */

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 dark:border-stone-700 py-16 px-6 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Toasts ---------------- */

export function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return createPortal(
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lift backdrop-blur-md text-sm font-medium max-w-xs",
              t.tone === "success" && "bg-white/90 dark:bg-stone-900/90 border-emerald-200 dark:border-emerald-900 text-ink dark:text-stone-100",
              t.tone === "info" && "bg-ink/95 dark:bg-stone-100/95 border-stone-700 text-paper dark:text-ink",
              t.tone === "error" && "bg-white/90 dark:bg-stone-900/90 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300",
            )}
          >
            <span
              className={cn(
                "grid place-items-center w-6 h-6 rounded-full shrink-0",
                t.tone === "success" && "bg-emerald-500 text-white",
                t.tone === "info" && "bg-ember-500 text-white dark:text-ink",
                t.tone === "error" && "bg-red-500 text-white",
              )}
            >
              {t.tone === "error" ? <X size={13} /> : t.tone === "info" ? <span className="w-1.5 h-1.5 rounded-full bg-white animate-ember-pulse" /> : <Check size={13} />}
            </span>
            <span className="leading-snug">{t.msg}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="ml-1 opacity-40 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
