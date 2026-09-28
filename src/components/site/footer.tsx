import Link from "next/link";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { FooterCta } from "./footer-cta";
import type { SettingsDTO } from "@/server/types";

const COLS = [
  { title: "Stay", links: [["All stays", "/stays"], ["Stay + Sattvik Food", "/stay-food"], ["Darshan Tours", "/darshan-tours"]] },
  { title: "VHI", links: [["About", "/about"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Cancellation policy", "/cancellation-policy"]] },
] as const;

export function Footer({ settings }: { settings: SettingsDTO }) {
  const b = settings.business;
  const year = new Date().getFullYear();
  const social = [
    [b.instagram, Instagram, "Instagram"],
    [b.facebook, Facebook, "Facebook"],
    [b.youtube, Youtube, "YouTube"],
  ] as const;
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x">
        {/* Top call-to-action (hidden on the homepage, which ends with its own) */}
        <FooterCta whatsapp={b.whatsapp} />

        <div className="grid gap-12 py-14 md:grid-cols-12 md:py-16">
          <div className="md:col-span-4">
            <img src="/brand/vhi-logo-light.png" alt="VHI Luxury Homestays" className="h-14 w-auto" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed">Private homes in the heart of Braj — for slow mornings, temple evenings and sattvik meals. {b.brandName}.</p>
            <div className="mt-6 flex gap-2">
              {social.map(([href, Icon, label]) =>
                href ? (
                  <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white hover:text-ink">
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </a>
                ) : null,
              )}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <p className="mb-5 text-sm font-semibold text-white">{c.title}</p>
              <ul className="space-y-3 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link className="transition-colors hover:text-white" href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="md:col-span-4">
            <p className="mb-5 text-sm font-semibold text-white">Reach us</p>
            <ul className="space-y-4 text-sm">
              {b.phone ? (
                <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} /><a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:text-white">{b.phone}</a></li>
              ) : null}
              {b.email ? (
                <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} /><a href={`mailto:${b.email}`} className="hover:text-white">{b.email}</a></li>
              ) : null}
              {b.address ? (
                <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} /><span className="whitespace-pre-line">{b.address}</span></li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} {b.legalName || b.brandName}. All rights reserved.{b.gstin ? ` · GSTIN ${b.gstin}` : ""}</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/cancellation-policy" className="hover:text-white">Cancellations</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
