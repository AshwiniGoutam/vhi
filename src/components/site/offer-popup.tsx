"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Gift, X } from "lucide-react";
import { formatINR } from "@/lib/money";

export interface PopupOffer {
  code: string;
  title: string;
  text?: string;
  ctaLabel?: string;
  finePrint?: string;
  type: "percent" | "flat";
  value: number;
  maxDiscount?: number;
  endsAt?: string;
}

const DELAY_MS = 5000;
const SNOOZE_DAYS = 3; // "Maybe later" hides it for 3 days
const KEY = "vhi_offer_popup";
export const COUPON_KEY = "vhi_coupon";

/** Offer modal shown 5 s after a visitor arrives (Admin → Coupons → "Show as website pop-up"). */
export function OfferPopup({ offer, defaultOpen = false }: { offer: PopupOffer; defaultOpen?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const quiet = !pathname || pathname.startsWith("/checkout") || pathname.startsWith("/booking") || pathname.startsWith("/admin");

  useEffect(() => {
    if (quiet) return;
    try {
      const seen = JSON.parse(localStorage.getItem(KEY) ?? "null") as { code: string; until: number } | null;
      if (seen && seen.code === offer.code && seen.until > Date.now()) return;
    } catch {
      /* storage unavailable */
    }
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [quiet, offer.code]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function remember(days: number) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ code: offer.code, until: Date.now() + days * 86_400_000 }));
    } catch {
      /* ignore */
    }
  }
  function dismiss() {
    remember(SNOOZE_DAYS);
    setOpen(false);
  }
  function claim() {
    try {
      localStorage.setItem(COUPON_KEY, offer.code); // pre-filled at checkout
    } catch {
      /* ignore */
    }
    remember(30);
    setOpen(false);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(offer.code);
      localStorage.setItem(COUPON_KEY, offer.code);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (!open) return null;
  const headline = offer.type === "percent" ? `${offer.value}% off` : `${formatINR(offer.value)} off`;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="offer-title" onClick={dismiss} style={{ animation: "offerFade .35s ease-out both" }}>
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white p-8 text-center shadow-2xl md:p-10" onClick={(e) => e.stopPropagation()} style={{ animation: "offerPop .45s cubic-bezier(.22,1,.36,1) both" }}>
        <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-brass/[0.1]" />
        <span aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-brass/[0.08]" />
        <button ref={closeRef} type="button" onClick={dismiss} aria-label="Close" className="cursor-pointer absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink">
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brass/[0.12] text-brass">
          <Gift className="h-9 w-9" strokeWidth={1.6} />
        </span>
        <p className="relative mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">{headline}{offer.maxDiscount && offer.type === "percent" ? ` · up to ${formatINR(offer.maxDiscount)}` : ""}</p>
        <h2 id="offer-title" className="display relative mt-2 text-[1.9rem] text-ink">{offer.title}</h2>
        {offer.text ? <p className="relative mt-3 leading-relaxed text-muted">{offer.text}</p> : null}

        <button type="button" onClick={copy} className="relative mx-auto mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-brass/50 bg-brass/[0.05] px-5 py-3 transition-colors hover:bg-brass/[0.1]" aria-label={`Copy code ${offer.code}`}>
          <span className="text-lg font-bold tracking-[0.18em] text-ink">{offer.code}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-brass">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
          </span>
        </button>

        <Link href="/stays" onClick={claim} className="btn btn-primary relative mt-6 w-full !py-3.5">
          {offer.ctaLabel || "Book now & save"}
        </Link>
        <button type="button" onClick={dismiss} className="relative mt-3 w-full py-2 text-sm font-medium text-charcoal hover:text-ink">
          Maybe later
        </button>
        <p className="relative mt-3 text-xs text-muted">
          {offer.finePrint || "Applied when you enter the code at checkout."}
          {offer.endsAt ? ` Valid until ${new Date(`${offer.endsAt}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}.` : ""}
        </p>
      </div>
      <style>{`@keyframes offerFade{from{opacity:0}to{opacity:1}}@keyframes offerPop{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
