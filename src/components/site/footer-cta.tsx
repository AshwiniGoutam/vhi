"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

/** Footer call-to-action row; skipped on the homepage, which already ends with a full-width CTA. */
export function FooterCta({ whatsapp }: { whatsapp?: string }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="flex flex-col gap-8 border-b border-white/10 py-14 md:flex-row md:items-end md:justify-between md:py-20">
      <h2 className="display max-w-xl text-4xl text-white md:text-5xl">
        Your stay in Vrindavan, <span className="text-sand">planned with care.</span>
      </h2>
      <div className="flex flex-wrap gap-3">
        <Link href="/stays" className="btn btn-light">Book a stay</Link>
        {whatsapp ? (
          <a href={whatsappLink(whatsapp, "Radhe Radhe! I'd like help planning a stay in Vrindavan.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
            <MessageCircle className="h-4 w-4" strokeWidth={1.8} /> WhatsApp us
          </a>
        ) : null}
      </div>
    </div>
  );
}
