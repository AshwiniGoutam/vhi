"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MessageCircle, Info } from "lucide-react";
import type { AddOnDTO, MealPlanDTO } from "@/server/types";
import { addDays, diffDays, todayIST } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { cn, whatsappLink } from "@/lib/utils";
import { trackBeginCheckout } from "@/lib/analytics/client";
import { ChildAges, Counter, QuoteSummary, Steps, useQuote } from "./shared";
import { AvailabilityCalendar } from "./availability-calendar";

const fmtDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export interface WidgetProperty {
  _id: string;
  slug: string;
  name: string;
  status: string;
  occupancy: { maxGuests: number; maxAdults: number; maxChildren: number };
  stayRules: { minNights: number; maxNights?: number };
  baseRate: number;
  /** Individually bookable rooms (villas). Empty = whole property only. */
  rooms?: { key: string; name: string; bedType?: string; maxGuests: number; baseRate: number; bathroom?: string }[];
}

interface Props {
  properties: WidgetProperty[];
  mealPlans: MealPlanDTO[];
  addOns: AddOnDTO[];
  whatsapp?: string;
  maxAdvanceDays: number;
  /** Stay + Food package mode */
  pkg?: { slug: string; title: string; nights: number };
  policySummary?: string;
  className?: string;
}

const mealEligible = (nights: number, m: MealPlanDTO) => (m.nightsRule === "gt" ? nights > m.minNights : nights >= m.minNights);
const ruleText = (m: MealPlanDTO) => (m.nightsRule === "gt" ? `more than ${m.minNights} nights` : `${m.minNights} nights or more`);

/** Steps 1–2 of the stay flow: dates + guests, then property / meal plan / add-ons. */
export function StayBookingWidget({ properties, mealPlans, addOns, whatsapp, maxAdvanceDays, pkg, policySummary, className }: Props) {
  const router = useRouter();
  const today = todayIST();
  const [propertyId, setPropertyId] = useState(properties[0]?._id ?? "");
  const property = properties.find((p) => p._id === propertyId) ?? properties[0];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  // Whole home vs. individual rooms (Airbnb-style)
  const roomsOffered = !pkg ? property?.rooms ?? [] : [];
  const [mode, setMode] = useState<"entire" | "rooms">("entire");
  const [roomKeys, setRoomKeys] = useState<string[]>([]);
  const roomsMode = mode === "rooms" && roomsOffered.length > 0;
  const selectedRooms = roomsOffered.filter((r) => roomKeys.includes(r.key));
  const roomCap = selectedRooms.reduce((t, r) => t + (r.maxGuests || 2), 0);
  const capacity = roomsMode ? { maxGuests: roomCap || 1, maxAdults: roomCap || 1, maxChildren: roomCap } : property?.occupancy ?? { maxGuests: 2, maxAdults: 2, maxChildren: 0 };
  const toggleRoom = (k: string) => setRoomKeys((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [mealPlanId, setMealPlanId] = useState<string>(pkg ? mealPlans[0]?._id ?? "" : "");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState("");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const maxDate = addDays(today, maxAdvanceDays);
  const effectiveCheckOut = pkg && checkIn ? addDays(checkIn, pkg.nights) : checkOut;
  const nights = checkIn && effectiveCheckOut ? diffDays(checkIn, effectiveCheckOut) : 0;

  useEffect(() => {
    if (!property) return;
    setLoadingAvailability(true);
    const roomsParam = roomsMode && roomKeys.length ? `&rooms=${encodeURIComponent(roomKeys.join(","))}` : "";
    fetch(`/api/availability?slug=${encodeURIComponent(property.slug)}&days=120${roomsParam}`)
      .then((r) => r.json())
      .then((j) => setUnavailable(j?.data?.unavailable ?? []))
      .catch(() => setUnavailable([]))
      .finally(() => setLoadingAvailability(false));
  }, [property, roomsMode, roomKeys]);

  useEffect(() => {
    const m = mealPlans.find((x) => x._id === mealPlanId);
    if (m && nights && !mealEligible(nights, m)) setMealPlanId("");
  }, [nights, mealPlanId, mealPlans]);

  const conflict = useMemo(() => {
    if (!checkIn || !effectiveCheckOut || nights <= 0) return [];
    const set = new Set(unavailable);
    return Array.from({ length: nights }, (_, i) => addDays(checkIn, i)).filter((n) => set.has(n));
  }, [checkIn, effectiveCheckOut, nights, unavailable]);

  const addOnList = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => ({ id, qty: q }));
  const ready = !!property && property.status === "active" && nights > 0 && conflict.length === 0 && (!roomsMode || roomKeys.length > 0) && adults + children <= capacity.maxGuests;

  const request = ready
    ? {
        propertySlug: property.slug,
        packageSlug: pkg?.slug,
        checkIn,
        checkOut: effectiveCheckOut,
        adults,
        children,
        childAges: childAges.slice(0, children),
        mealPlanId: mealPlanId || undefined,
        roomKeys: roomsMode ? roomKeys : undefined,
        addOns: addOnList,
      }
    : null;
  const { quote, error, loading } = useQuote(request ? { vertical: "stay", request } : null);

  function reserve() {
    if (!request || !quote) return;
    const sp = new URLSearchParams({ type: "stay", data: JSON.stringify({ ...request, specialRequests: requests || undefined }) });
    trackBeginCheckout({ id: property._id, name: pkg ? `${pkg.title} · ${property.name}` : property.name, vertical: pkg ? "stay_food" : "stay", value: quote.total });
    router.push(`/checkout?${sp.toString()}`);
  }

  if (!property) return null;
  const waText = `Radhe Radhe! I'd like to book ${pkg ? `${pkg.title} at ` : ""}${property.name}${checkIn ? ` from ${checkIn}` : ""}${effectiveCheckOut && checkIn ? ` to ${effectiveCheckOut}` : ""} ${roomsMode && selectedRooms.length ? ` (rooms: ${selectedRooms.map((r) => r.name).join(", ")})` : ""} for ${adults + children} guests.`;

  return (
    <div className={cn("border hairline bg-paper p-6 md:p-7", className)}>
      <div className="mb-6 flex items-baseline justify-between">
        {pkg ? (
          <p className="display text-2xl text-ink">{pkg.nights} nights</p>
        ) : (
          <p>
            <span className="display text-3xl text-ink">
              {roomsMode ? (selectedRooms.length ? formatINR(selectedRooms.reduce((t, r) => t + r.baseRate, 0)) : `from ${formatINR(Math.min(...roomsOffered.map((r) => r.baseRate)))}`) : property.baseRate ? formatINR(property.baseRate) : "—"}
            </span>
            <span className="text-sm text-muted"> / night</span>
          </p>
        )}
        <Steps current={1} steps={["Dates", "Stay"]} />
      </div>

      {property.status !== "active" ? (
        <p className="mb-5 bg-linen p-4 text-sm text-umber">This home is temporarily unavailable for booking. Message us on WhatsApp for alternatives.</p>
      ) : null}

      {roomsOffered.length ? (
        <div className="mb-5">
          <div className="grid grid-cols-2 rounded-full border border-black/[0.08] bg-white p-1 text-sm font-semibold" role="tablist" aria-label="What would you like to book?">
            {(
              [
                ["entire", "Entire home"],
                ["rooms", "Choose rooms"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn("rounded-full py-2 transition-colors", mode === k ? "bg-ink text-white" : "text-charcoal hover:bg-black/5")}>
                {label}
              </button>
            ))}
          </div>
          {roomsMode ? (
            <fieldset className="mt-4 space-y-2">
              <legend className="field-label mb-2">Select one or more rooms</legend>
              {roomsOffered.map((r) => {
                const on = roomKeys.includes(r.key);
                return (
                  <label key={r.key} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition-colors", on ? "border-ink bg-white" : "border-black/[0.08] hover:border-black/20")}>
                    <input type="checkbox" checked={on} onChange={() => toggleRoom(r.key)} className="mt-1 accent-charcoal" />
                    <span className="flex-1">
                      <span className="flex justify-between gap-3">
                        <span className="font-semibold text-ink">{r.name}</span>
                        <span className="tabular-nums text-ink">{formatINR(r.baseRate)}<span className="text-muted"> /night</span></span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{[r.bedType, `up to ${r.maxGuests} guests`, r.bathroom === "shared" ? "shared bathroom" : "attached bathroom"].filter(Boolean).join(" · ")}</span>
                    </span>
                  </label>
                );
              })}
              <p className="text-xs text-muted">Booking the entire home gives your group every room. Individual rooms may share the home with other guests.</p>
            </fieldset>
          ) : null}
        </div>
      ) : null}

      {properties.length > 1 ? (
        <label className="field mb-4">
          <span className="field-label">Choose your stay</span>
          <select className="input" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <button type="button" onClick={() => setCalendarOpen((v) => !v)} className="grid w-full grid-cols-2 gap-px border hairline bg-charcoal/10 text-left" aria-expanded={calendarOpen}>
        <span className="field bg-paper p-3">
          <span className="field-label flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> Check-in</span>
          <span className="text-sm">{checkIn ? fmtDate(checkIn) : "Add date"}</span>
        </span>
        <span className="field bg-paper p-3">
          <span className="field-label">Check-out</span>
          <span className="text-sm">{effectiveCheckOut ? fmtDate(effectiveCheckOut) : "Add date"}</span>
        </span>
      </button>
      {calendarOpen ? (
        <div className="border border-t-0 hairline bg-ivory p-4">
          <AvailabilityCalendar
            unavailable={unavailable}
            checkIn={checkIn}
            checkOut={pkg ? effectiveCheckOut : checkOut}
            minDate={today}
            maxDate={maxDate}
            minNights={Math.max(1, property.stayRules.minNights)}
            fixedNights={pkg?.nights}
            loading={loadingAvailability}
            onChange={({ checkIn: ci, checkOut: co }) => {
              setCheckIn(ci);
              setCheckOut(co);
              if (ci && (co || pkg)) setCalendarOpen(false);
            }}
          />
        </div>
      ) : null}
      {conflict.length ? <p className="mt-3 text-sm text-danger">Some nights in this range are booked ({conflict.slice(0, 3).join(", ")}{conflict.length > 3 ? "…" : ""}). Please try other dates.</p> : null}

      <div className="mt-4 divide-y hairline border-y">
        <Counter label="Adults" value={adults} min={1} max={capacity.maxAdults || capacity.maxGuests} onChange={setAdults} />
        <Counter label="Children" hint="Under 18" value={children} min={0} max={Math.max(0, Math.min(capacity.maxChildren, capacity.maxGuests - adults))} onChange={setChildren} />
        <ChildAges count={children} ages={childAges} onChange={setChildAges} />
      </div>
      <p className={cn("mt-2 text-xs", adults + children > capacity.maxGuests ? "text-danger" : "text-muted")}>
        {roomsMode && !roomKeys.length ? "Select at least one room · " : ""}Up to {capacity.maxGuests} guests{roomsMode && roomKeys.length ? " in the selected rooms" : ""}
        {property.stayRules.minNights > 1 ? ` · minimum ${property.stayRules.minNights} nights` : ""}
        {adults + children > capacity.maxGuests ? " — add a room or reduce guests" : ""}
      </p>

      {mealPlans.length ? (
        <fieldset className="mt-6">
          <legend className="field-label mb-3">Sattvik meal plan</legend>
          <div className="space-y-2">
            {!pkg ? (
              <label className="flex cursor-pointer items-center gap-3 border hairline p-3 text-sm has-[:checked]:border-charcoal">
                <input type="radio" name="meal" checked={!mealPlanId} onChange={() => setMealPlanId("")} className="accent-charcoal" />
                Room only
              </label>
            ) : null}
            {mealPlans.map((m) => {
              const ok = !nights || mealEligible(nights, m);
              return (
                <label key={m._id} className={cn("flex cursor-pointer items-start gap-3 border hairline p-3 text-sm has-[:checked]:border-charcoal", !ok && "cursor-not-allowed opacity-50")}>
                  <input type="radio" name="meal" disabled={!ok} checked={mealPlanId === m._id} onChange={() => setMealPlanId(m._id)} className="mt-1 accent-charcoal" />
                  <span className="flex-1">
                    <span className="flex justify-between gap-3">
                      <span className="text-charcoal">{m.name}</span>
                      <span className="tabular-nums text-muted">{formatINR(m.adultPrice)}{m.pricingModel === "per_person_per_night" ? " / adult / night" : " / night"}</span>
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {ok ? m.description : `Available on stays of ${ruleText(m)}.`}
                      {ok && m.childPrice ? ` Children ${m.childAgeMin}–${m.childAgeMax}: ${formatINR(m.childPrice)}.` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {addOns.length ? (
        <fieldset className="mt-6">
          <legend className="field-label mb-1">Add-ons</legend>
          <div className="divide-y hairline">
            {addOns.map((a) => (
              <Counter
                key={a._id}
                label={a.name}
                hint={a.pricingUnit === "on_request" || !a.price ? "Arranged on request" : `${formatINR(a.price)} ${a.pricingUnit.replace("per_", "per ").replace("_", " ")}`}
                value={qty[a._id] ?? 0}
                min={0}
                max={a.pricingUnit === "per_person" || a.pricingUnit === "per_booking" ? 1 : a.maxQty ?? 10}
                onChange={(v) => setQty((q) => ({ ...q, [a._id]: v }))}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      <label className="field mt-6">
        <span className="field-label">Special requests</span>
        <textarea className="input min-h-20 text-sm" maxLength={1000} value={requests} onChange={(e) => setRequests(e.target.value)} placeholder="Arrival time, dietary notes, celebrations…" />
      </label>

      <div className="mt-6">
        {error ? <p className="mb-3 text-sm text-danger">{error.message}</p> : null}
        <QuoteSummary quote={quote} loading={loading} />
        {!quote && !error ? <p className="flex items-center gap-2 text-sm text-muted"><Info className="h-4 w-4" strokeWidth={1.4} /> Select dates to see your total.</p> : null}
      </div>

      <button type="button" onClick={reserve} disabled={!quote || loading} className="btn btn-primary mt-6 w-full">
        Reserve
      </button>
      {whatsapp ? (
        <a href={whatsappLink(whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3 w-full">
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Ask on WhatsApp
        </a>
      ) : null}
      <p className="mt-4 text-center text-xs text-muted">You won&apos;t be charged yet. {policySummary ?? ""}</p>
    </div>
  );
}
