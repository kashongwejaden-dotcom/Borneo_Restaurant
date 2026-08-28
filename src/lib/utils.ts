import { useEffect, useRef, useState } from "react";
import type { Promotion } from "./types";

/** Merge class names, skipping falsy values. */
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Format RWF currency: 12500 -> "FRw 12,500" */
export function money(n: number) {
  return "FRw " + Math.round(n).toLocaleString("en-US");
}

let uidCounter = 1000;
export function uid(prefix = "id") {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${uidCounter}`;
}

export function orderCode() {
  return "BR-" + (1040 + Math.floor(Math.random() * 900) + uidCounter % 60);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function fmtTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function timeAgo(ms: number) {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function prettyDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** A promotion is live when enabled and now falls inside its window. */
export function isPromoLive(p: Promotion, now = Date.now()) {
  return p.active && now >= p.start && now <= p.end;
}

export function promoWindow(p: Promotion) {
  const f = (ms: number) =>
    new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return `${f(p.start)} → ${f(p.end)}`;
}

/** toLocalInputValue: epoch ms -> value for <input type="datetime-local"> */
export function toLocalInput(ms: number) {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromLocalInput(v: string) {
  return new Date(v).getTime();
}

/** Animated counter — eases toward `target` whenever it changes (metrics feel alive). */
export function useCountUp(target: number, duration = 850) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      prev.current = target;
      setVal(target);
      return;
    }
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/** Simulated network latency so skeleton states are visible (like a real fetch). */
export function useFakeLoad(ms = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
