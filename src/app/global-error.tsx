"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ background: "#ffffff", fontFamily: "system-ui, sans-serif", color: "#171717", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ letterSpacing: "0.2em", fontSize: 12, textTransform: "uppercase" }}>VHI</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 40 }}>Something went wrong.</h1>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px 20px", background: "#0a0a0a", color: "#ffffff", border: 0, borderRadius: 999, cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
