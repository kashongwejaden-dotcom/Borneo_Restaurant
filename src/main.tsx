import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/* ------------------------------------------------------------------ */
/*  Fatal-error net. Rules of the kitchen:                             */
/*   1. A React render crash ALWAYS paints the diagnostic panel.       */
/*   2. Boot-time failures (before React mounts) paint the panel too — */
/*      a splash that never resolves must explain itself.              */
/*   3. Once the app is live, stray async errors (HMR websockets,      */
/*      dropped promises) are logged but never blank a working UI.     */
/* ------------------------------------------------------------------ */

const PANEL_STYLE =
  "min-height:100vh;display:grid;place-items:center;background:#1c1917;color:#faf8f5;font-family:system-ui,sans-serif;padding:24px;";

/** Tooling noise that must never be mistaken for an app failure. */
function isNoise(msg: string) {
  return /vite|websocket|hot ?update|hmr|client:\d|network|failed to fetch|load failed|abort/i.test(msg);
}

/** True while the HTML splash is still on screen, i.e. React hasn't mounted. */
function isPreMount() {
  return !!document.querySelector("#root .boot");
}

function showFatalError(title: string, detail: string) {
  // idempotent — only ever show the first error
  if (document.getElementById("eatlocal-fatal")) return;
  const host = document.getElementById("root") ?? document.body;
  host.innerHTML = `
    <div id="eatlocal-fatal" style="${PANEL_STYLE}">
      <div style="max-width:600px;width:100%;">
        <p style="color:#f97316;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;font-size:12px;margin:0 0 14px;text-align:center;">EatLocal OS · kitchen error</p>
        <h1 style="font-family:Georgia,serif;font-size:32px;margin:0 0 10px;text-align:center;">${title}</h1>
        <p style="color:#a8a29e;font-size:14px;line-height:1.6;text-align:center;margin:0 0 18px;">
          The app hit a failure before it could plate the page. The details below are safe to share with the dev team.
        </p>
        <pre id="eatlocal-fatal-detail" style="margin:0;padding:16px;border-radius:12px;background:#0c0a09;border:1px solid #44403c;color:#fdba74;font-size:12px;text-align:left;overflow:auto;max-height:240px;white-space:pre-wrap;word-break:break-word;"></pre>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:18px;flex-wrap:wrap;">
          <button id="eatlocal-fatal-clear" style="padding:12px 26px;border-radius:10px;border:none;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-weight:700;font-size:14px;cursor:pointer;">Clear local data & reload</button>
          <button id="eatlocal-fatal-reload" style="padding:12px 26px;border-radius:10px;border:1px solid #57534e;background:transparent;color:#e7e5e4;font-weight:700;font-size:14px;cursor:pointer;">Just reload</button>
        </div>
      </div>
    </div>`;
  const pre = document.getElementById("eatlocal-fatal-detail");
  if (pre) pre.textContent = detail.slice(0, 4000);
  document.getElementById("eatlocal-fatal-clear")?.addEventListener("click", () => {
    try { localStorage.clear(); } catch { /* noop */ }
    location.reload();
  });
  document.getElementById("eatlocal-fatal-reload")?.addEventListener("click", () => location.reload());
}

/** React render-time boundary — the only failure that may replace a live UI. */
class BootBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    // defer one tick so React finishes committing the (empty) boundary tree
    // before we repaint the container with plain DOM
    setTimeout(
      () => showFatalError("Something burned in the render pass", `${error?.message ?? error}\n\n${error?.stack ?? ""}`),
      0,
    );
  }
  render() {
    if (this.state.error) return null; // showFatalError has already painted the panel
    return this.props.children;
  }
}

/* global nets — module-load failures, async throws, rejected promises */
window.addEventListener("error", (e) => {
  const msg = `${e.message ?? "Unknown error"}`;
  if (isNoise(msg)) return;
  if (isPreMount()) {
    showFatalError("The kitchen failed to fire up", `${msg}\n\nat ${e.filename ?? "?"}:${e.lineno ?? "?"}\n\n${e.error?.stack ?? ""}`);
  } else {
    console.error("[EatLocal OS] uncaught:", e.error ?? msg);
  }
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason as Error | string | undefined;
  const msg = typeof reason === "string" ? reason : `${reason?.message ?? reason}`;
  if (isNoise(msg)) {
    e.preventDefault(); // dev-tooling noise (e.g. HMR socket) — silence it
    return;
  }
  if (isPreMount()) {
    showFatalError(
      "A promise fell on the floor",
      typeof reason === "string" ? reason : `${reason?.message ?? reason}\n\n${reason?.stack ?? ""}`,
    );
  } else {
    e.preventDefault();
    console.error("[EatLocal OS] unhandled rejection:", reason);
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BootBoundary>
    <App />
  </BootBoundary>,
);
