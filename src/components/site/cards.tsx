import Link from "next/link";
import { ArrowUpRight, BedDouble, Users, Bath, CalendarDays, Moon } from "lucide-react";
import { formatINR } from "@/lib/money";
import type { PackageDTO, PropertyDTO, TourDTO } from "@/server/types";
import { Photo } from "./photo";

export const TYPE_LABEL: Record<string, string> = { studio: "Studio", "1bhk": "1 BHK", "2bhk": "2 BHK", "3bhk": "3 BHK", "4bhk": "4 BHK", villa: "Villa" };

/** Stay card: square photo with chips, clean text block, clear nightly price. */
export function PropertyCard({ p, priority }: { p: PropertyDTO; priority?: boolean }) {
  const onSale = p.pricing.compareAtRate && p.pricing.compareAtRate > p.pricing.baseRate;
  return (
    <Link href={`/stays/${p.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl">
        <Photo media={p.featuredImage ?? p.gallery?.[0]} alt={p.featuredImage?.alt || p.name} className="aspect-square !rounded-none" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" priority={priority} crop="ar_1:1" label={p.name} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="chip">{TYPE_LABEL[p.type] ?? p.type}</span>
          {p.label ? <span className="chip !bg-ink/85 !text-white">{p.label}</span> : null}
          {onSale ? <span className="chip !bg-brass !text-white">Offer</span> : null}
        </div>
        {p.status === "maintenance" ? <span className="chip absolute bottom-3 left-3">Temporarily unavailable</span> : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[1.08rem] font-semibold tracking-tight text-ink">{p.name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {p.location?.area && p.location.area !== (p.location?.city ?? "Vrindavan") ? `${p.location.area}, ` : ""}
            {p.location?.city ?? "Vrindavan"}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-muted">
        <span className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" strokeWidth={1.6} />{p.bedrooms} bed</span>
        <span className="inline-flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" strokeWidth={1.6} />{p.bathrooms} bath</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" strokeWidth={1.6} />{p.occupancy.maxGuests} guests</span>
      </p>
      {p.pricing.baseRate > 0 ? (
        <p className="mt-3 text-[0.95rem]">
          {onSale ? <s className="mr-1.5 text-sm text-muted">{formatINR(p.pricing.compareAtRate!)}</s> : null}
          <span className="font-semibold text-ink">{formatINR(p.pricing.baseRate)}</span>
          <span className="text-sm text-muted"> / night</span>
        </p>
      ) : null}
    </Link>
  );
}

/** Darshan journey: photo card with overlay text. */
export function TourCard({ t, large }: { t: TourDTO; large?: boolean }) {
  return (
    <Link href={`/darshan-tours/${t.slug}`} className="group relative block overflow-hidden rounded-3xl bg-ink text-white">
      <Photo
        media={t.heroImage ?? t.gallery?.[0]}
        alt={t.title}
        className={large ? "aspect-square !rounded-none md:aspect-[16/10]" : "aspect-square !rounded-none"}
        imgClassName="transition duration-[1200ms] ease-out group-hover:scale-[1.05]"
        sizes="(min-width:1024px) 40vw, 100vw"
        label="Darshan"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
      <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-1.5">
        {t.durationLabel ? <span className="chip"><Moon className="h-3 w-3" />{t.durationLabel}</span> : null}
        <span className="chip !bg-ink/55 !text-white">Min. {t.minGroupSize} guests</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <h3 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{t.title}</h3>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-sm text-white/75">
            {t.pricing.adultPrice > 0 ? (
              <>
                <span className="text-xl font-semibold text-white">{formatINR(t.pricing.adultPrice)}</span> / person
              </>
            ) : (
              "Price on request"
            )}
          </p>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Stay + Food package: soft card with nights badge. */
export function PackageCard({ p }: { p: PackageDTO }) {
  return (
    <Link href={`/stay-food/${p.slug}`} className="group block rounded-3xl bg-paper p-2.5 transition-shadow duration-500 hover:shadow-[0_24px_50px_-24px_rgba(18,17,16,0.35)]">
      <div className="relative overflow-hidden rounded-2xl">
        <Photo media={p.heroImage} alt={p.title} className="aspect-[4/3] !rounded-none" imgClassName="transition-transform duration-700 group-hover:scale-[1.05]" sizes="(min-width:1024px) 33vw, 100vw" label={`${p.nights} nights`} />
        <span className="chip absolute left-3 top-3"><CalendarDays className="h-3 w-3" />{p.nights} nights</span>
      </div>
      <div className="px-3 pb-3 pt-5">
        <h3 className="text-lg font-semibold tracking-tight text-ink">{p.title}</h3>
        {p.tagline ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.tagline}</p> : null}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-medium text-charcoal">{p.pricingMode === "dynamic" ? "Stay + meal plan" : p.price ? `From ${formatINR(p.price)}` : "View details"}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </Link>
  );
}
