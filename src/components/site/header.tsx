"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X, ArrowUpRight } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";

const NAV = [
  { href: "/stays", label: "Stays" },
  { href: "/stay-food", label: "Stay + Food" },
  { href: "/darshan-tours", label: "Darshan Tours" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Floating glass header: transparent over hero banners, frosted white pill once scrolled. */
export function Header({ phone, whatsapp }: { phone?: string; whatsapp?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Pages that open with a full-bleed banner: header starts transparent over it.
  const overHero = pathname === "/" || pathname === "/stays" || pathname === "/stay-food" || pathname?.startsWith("/darshan-tours");
  const solid = scrolled || !overHero || open;
  // The banner slider announces each slide's text tone; dark text = light photo.
  const [heroTone, setHeroTone] = useState<"dark" | "light">("light");
  const darkText = solid || heroTone === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onTone = (e: Event) => setHeroTone((e as CustomEvent<"dark" | "light">).detail === "dark" ? "dark" : "light");
    window.addEventListener("vhi:hero-tone", onTone);
    return () => window.removeEventListener("vhi:hero-tone", onTone);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-[1320px] items-center justify-between rounded-full pl-5 pr-2 transition-all duration-500 md:pl-7",
          solid ? "border border-black/5 bg-white/85 shadow-[0_10px_40px_-12px_rgba(18,17,16,0.18)] backdrop-blur-xl" : "border border-transparent bg-transparent",
        )}
      >
        <Link href="/" aria-label="VHI Luxury Homestays — home" className="relative block h-10 w-[66px] shrink-0">
          <img src="/brand/vhi-logo-dark.png" alt="VHI Luxury Homestays" className={cn("absolute inset-0 h-full w-auto transition-opacity duration-500", darkText ? "opacity-100" : "opacity-0")} />
          <img src="/brand/vhi-logo-light.png" alt="" aria-hidden className={cn("absolute inset-0 h-full w-auto transition-opacity duration-500", darkText ? "opacity-0" : "opacity-100")} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => {
            const active = pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors",
                  darkText ? "text-charcoal hover:bg-black/5" : "text-white hover:bg-white/15",
                  active && (darkText ? "bg-black/5" : "bg-white/15"),
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              aria-label={`Call ${phone}`}
              className={cn("hidden h-11 w-11 items-center justify-center rounded-full transition-colors md:flex", darkText ? "text-charcoal hover:bg-black/5" : "text-white hover:bg-white/15")}
            >
              <Phone className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </a>
          ) : null}
          <Link href="/stays" className={cn("btn hidden !py-2.5 sm:inline-flex", darkText ? "btn-primary" : "btn-light")}>
            Book a stay
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn("flex h-11 w-11 items-center justify-center rounded-full lg:hidden", darkText ? "text-charcoal hover:bg-black/5" : "text-white hover:bg-white/15")}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Menu className="h-5 w-5" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-x-3 bottom-3 top-[5.5rem] z-40 flex flex-col justify-between overflow-y-auto rounded-3xl border border-black/5 bg-white p-6 shadow-2xl lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {[...NAV, { href: "/faq", label: "FAQ" }].map((n, i) => (
              <Link key={n.href} href={n.href} className="flex items-center justify-between border-b border-black/5 py-4 text-2xl font-semibold tracking-tight text-ink" style={{ animation: `fadeUp .5s ${i * 50}ms both` }}>
                {n.label}
                <ArrowUpRight className="h-5 w-5 text-taupe" strokeWidth={1.6} />
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {phone ? (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn btn-outline">
                <Phone className="h-4 w-4" /> Call
              </a>
            ) : null}
            {whatsapp ? (
              <a href={whatsappLink(whatsapp, "Radhe Radhe! I'd like to know more about staying with VHI.")} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
          </div>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
        </div>
      ) : null}
    </header>
  );
}
