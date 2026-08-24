import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/**
 * Error boundary: if anything throws during render we show the actual error
 * instead of a blank white screen, so problems are always diagnosable.
 */
class BootBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#1c1917", color: "#faf8f5", fontFamily: "system-ui, sans-serif", padding: 24 }}>
          <div style={{ maxWidth: 560, textAlign: "center" }}>
            <p style={{ color: "#f97316", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 12 }}>EatLocal OS · kitchen error</p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "14px 0 10px" }}>Something burned in the render pass</h1>
            <p style={{ color: "#a8a29e", fontSize: 14, lineHeight: 1.6 }}>
              The app threw before it could plate the page. The details below are safe to share with the dev team.
            </p>
            <pre style={{ marginTop: 18, padding: 16, borderRadius: 12, background: "#0c0a09", border: "1px solid #44403c", color: "#fdba74", fontSize: 12, textAlign: "left", overflow: "auto", maxHeight: 220 }}>
              {String(this.state.error?.message ?? this.state.error)}
              {"\n\n"}
              {this.state.error?.stack ?? ""}
            </pre>
            <button
              onClick={() => {
                try { localStorage.clear(); } catch { /* noop */ }
                location.reload();
              }}
              style={{ marginTop: 18, padding: "12px 26px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Clear local data & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BootBoundary>
    <App />
  </BootBoundary>,
);
