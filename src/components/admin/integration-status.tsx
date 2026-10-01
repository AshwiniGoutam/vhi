"use client";

import { useEffect, useState } from "react";
import { Badge } from "./shell";

type Health = Record<string, Record<string, unknown> | string>;

/** Read-only view of which providers are live. Secrets are configured in environment variables, never here. */
export function IntegrationStatus() {
  const [h, setH] = useState<Health | null>(null);
  useEffect(() => {
    fetch("/api/admin/health").then((r) => r.json()).then((j) => setH(j.data ?? null)).catch(() => setH(null));
  }, []);
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  async function sendTest() {
    setTesting(true);
    setTestMsg(null);
    const res = await fetch("/api/admin/health/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: testTo }) });
    const j = await res.json().catch(() => ({}));
    setTesting(false);
    if (j.ok) setTestMsg({ ok: true, text: j.data.console ? "Sent to the server console (EMAIL_PROVIDER=console). Set resend or smtp to deliver real emails." : `Sent via ${j.data.provider}. Check the inbox (and spam folder).` });
    else setTestMsg({ ok: false, text: j?.error?.message ?? "Failed" });
  }
  if (!h) return null;
  const rows: [string, string, boolean][] = [
    ["Environment", String(h.environment), true],
    ["Payments", `${(h.payments as Record<string, unknown>).provider}${(h.payments as Record<string, unknown>).webhookSecret ? " · webhook secret set" : ""}`, Boolean((h.payments as Record<string, unknown>).configured)],
    ["Channel manager", `${(h.channelManager as Record<string, unknown>).provider} — ${(h.channelManager as Record<string, unknown>).message}`, Boolean((h.channelManager as Record<string, unknown>).ok)],
    ["Cloudinary", (h.cloudinary as Record<string, unknown>).configured ? "configured" : "not configured (paste-URL fallback only)", Boolean((h.cloudinary as Record<string, unknown>).configured)],
    ["WhatsApp", String((h.whatsapp as Record<string, unknown>).provider), (h.whatsapp as Record<string, unknown>).provider !== "console"],
    ["Email", `${(h.email as Record<string, unknown>).provider}${(h.email as Record<string, unknown>).smtpHost ? ` (${(h.email as Record<string, unknown>).smtpHost})` : ""} · ${(h.email as Record<string, unknown>).from}`, (h.email as Record<string, unknown>).provider !== "console"],
    ["Analytics", Object.entries(h.analytics as Record<string, boolean>).map(([k, v]) => `${k} ${v ? "✓" : "–"}`).join(" · "), true],
    ["Cron secret", (h.cron as Record<string, unknown>).secretSet ? "set" : "missing", Boolean((h.cron as Record<string, unknown>).secretSet)],
  ];
  return (
    <details className="mb-8 border hairline bg-paper" open>
      <summary className="cursor-pointer px-5 py-4 text-sm font-medium">Integrations status</summary>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v, ok]) => (
            <tr key={k} className="border-t hairline">
              <td className="w-44 px-5 py-3 text-muted">{k}</td>
              <td className="px-5 py-3">{v}</td>
              <td className="px-5 py-3 text-right"><Badge value={ok ? "active" : "pending"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t hairline p-5">
        <p className="text-sm font-semibold text-ink">Send a test email</p>
        <p className="mt-1 text-xs text-muted">Checks your email settings end-to-end using the same layout guests receive.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="input !w-72 !py-2 text-sm" type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          <button type="button" className="btn btn-primary !py-2.5" disabled={testing || !testTo} onClick={sendTest}>{testing ? "Sending…" : "Send test"}</button>
        </div>
        {testMsg ? <p className={`mt-3 text-sm ${testMsg.ok ? "text-success" : "text-danger"}`}>{testMsg.text}</p> : null}
      </div>
    </details>
  );
}
