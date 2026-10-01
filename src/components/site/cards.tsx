import Link from "next/link";
import { ArrowUpRight, CalendarDays, Moon } from "lucide-react";
import { formatINR } from "@/lib/money";
import type { PackageDTO, PropertyDTO, TourDTO } from "@/server/types";
import { Photo } from "./photo";
import { Icon } from "./icon";

export const TYPE_LABEL: Record<string, string> = { studio: "Studio", "1bhk": "1 BHK", "2bhk": "2 BHK", "3bhk": "3 BHK", "4bhk": "4 BHK", villa: "Villa" };

/** Stay card: tags on the photo, highlighted amenities, starting price and a clear "Explore" button. */
export function PropertyCard({ p, priority }: { p: PropertyDTO; priority?: boolean }) {
  const onSale = p.pricing.compareAtRate && p.pricing.compareAtRate > p.pricing.baseRate;
  const rooms = (p.roomBooking?.enabled ? p.rooms ?? [] : []).filter((r) => r.active !== false && r.baseRate > 0);
  const roomFrom = rooms.length ? Math.min(...rooms.map((r) => r.baseRate)) : 0;
  const amenities = p.amenities ?? [];
  const shown = amenities.slice(0, 4);
  const more = amenities.length - shown.length;
  const tags = [TYPE_LABEL[p.type] ?? p.type, ...(p.collections ?? []).slice(0, 2)];
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-black/[0.06] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-24px_rgba(0,0,0,0.25)] transition-shadow duration-500 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_28px_60px_-24px_rgba(0,0,0,0.35)]">
      <Link href={`/stays/${p.slug}`} className="relative block overflow-hidden rounded-2xl" tabIndex={-1} aria-hidden>
        <Photo media={p.featuredImage ?? p.gallery?.[0]} alt={p.featuredImage?.alt || p.name} className="aspect-[4/3] !rounded-none" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" priority={priority} crop="ar_4:3" label={p.name} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brass shadow-sm">{t}</span>
          ))}
          {p.label ? <span className="rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white">{p.label}</span> : null}
          {onSale ? <span className="rounded-full bg-brass px-3 py-1 text-xs font-semibold text-white">Offer</span> : null}
        </div>
        {rooms.length ? <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Entire home or by room</span> : null}
        {p.status === "maintenance" ? <span className="chip absolute bottom-3 right-3">Temporarily unavailable</span> : null}
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <Link href={`/stays/${p.slug}`} className="block">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{p.name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {p.location?.area && p.location.area !== (p.location?.city ?? "Vrindavan") ? `${p.location.area}, ` : ""}
            {p.location?.city ?? "Vrindavan"} · {p.bedrooms} bed · {p.bathrooms} bath · up to {p.occupancy.maxGuests} guests
          </p>
        </Link>

        {shown.length ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Amenities">
            {shown.map((a) => (
              <li key={a._id} className="inline-flex items-center gap-1.5 rounded-lg border border-brass/15 bg-brass/[0.07] px-2.5 py-1.5 text-[0.8rem] font-medium text-ink">
                <Icon name={a.icon} className="h-3.5 w-3.5 text-brass" strokeWidth={1.8} />
                {a.name}
              </li>
            ))}
            {more > 0 ? (
              <li>
                <Link href={`/stays/${p.slug}#amenities`} className="inline-flex items-center rounded-lg border border-brass/25 px-2.5 py-1.5 text-[0.8rem] font-semibold text-brass hover:bg-brass/[0.07]">
                  +{more} more
                </Link>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {p.pricing.baseRate > 0 || roomFrom > 0 ? (
              <>
                <p className="text-xs text-muted">{roomFrom && (!p.pricing.baseRate || roomFrom < p.pricing.baseRate) ? "Rooms from" : "Starting from"}</p>
                <p className="mt-0.5 whitespace-nowrap">
                  {onSale && !roomFrom ? <s className="mr-1.5 text-sm text-muted">{formatINR(p.pricing.compareAtRate!)}</s> : null}
                  <span className="text-xl font-bold text-ink">{formatINR(roomFrom && (!p.pricing.baseRate || roomFrom < p.pricing.baseRate) ? roomFrom : p.pricing.baseRate)}</span>
                  <span className="text-sm text-muted"> /night</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Price on request</p>
            )}
          </div>
          <Link href={`/stays/${p.slug}`} className="btn btn-primary !px-5 !py-3 text-sm">
            Explore property <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </article>
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
