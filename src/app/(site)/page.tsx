import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, MessageCircle, Home, UtensilsCrossed, Mountain, HeartHandshake, KeyRound, Car, Star } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { PackageCard, PropertyCard, TourCard } from "@/components/site/cards";
import { FaqList } from "@/components/site/faq-list";
import { Icon } from "@/components/site/icon";
import { JsonLd } from "@/components/site/json-ld";
import { getSettings } from "@/server/services/settings.service";
import {
  listAddOns, listBanners, listExperiences, listFaqs, listFeaturedProperties, listHomepageOffers, listPackages, listReels, listTestimonials, listTours,
} from "@/server/services/catalog.service";
import { formatINR } from "@/lib/money";
import { appUrl, cn, paragraphs, whatsappLink } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { Reels } from "@/components/site/reels";
import { HeroSlider, type HeroSlide } from "@/components/site/hero-slider";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata({
    title: s.seo?.defaultTitle || "VHI · Luxury Homestays in Vrindavan",
    description: s.seo?.defaultDescription || "Private luxury homestays, sattvik food and guided Darshan journeys in Vrindavan.",
    path: "/",
    image: s.seo?.ogImage ?? s.home.heroImage,
  });
}

const DEFAULT_WHY = [
  { title: "Whole homes, not rooms", body: "Every VHI stay is a private apartment or villa — your own kitchen, living room and quiet, minutes from the temples." },
  { title: "Hosted by locals", body: "We live in Vrindavan. Darshan timings, aarti, the right ghat at the right hour — we'll tell you, and arrange it." },
  { title: "Sattvik by design", body: "Freshly cooked vegetarian meals without onion or garlic, served at home on longer stays." },
  { title: "One place for everything", body: "Pick-ups, cabs, scooty rentals and guided Braj journeys, booked with your stay." },
];

export default async function HomePage() {
  const [settings, banners, featured, tours, packages, experiences, testimonials, offers, addOns, faqs, reels] = await Promise.all([
    getSettings(),
    listBanners("home_hero"),
    listFeaturedProperties(6),
    listTours(),
    listPackages(),
    listExperiences(),
    listTestimonials(6),
    listHomepageOffers(),
    listAddOns(),
    listFaqs({ homepage: true }),
    listReels(),
  ]);
  const h = settings.home;
  const heroImage = banners[0]?.image ?? h.heroImage;
  // Every published "Homepage slider" banner is a slide; Settings → Homepage is the fallback slide.
  const slides: HeroSlide[] = banners.length
    ? banners.map((b) => ({ id: b._id, eyebrow: b.eyebrow, title: b.title, titleAccent: b.titleAccent, subtitle: b.subtitle, textTone: b.textTone, image: b.image, mobileImage: b.mobileImage, video: b.video, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref }))
    : [
        {
          id: "default",
          eyebrow: h.heroEyebrow || "Luxury homestays in Vrindavan",
          title: h.heroTitle || "Vrindavan,",
          titleAccent: h.heroAccent || "as it’s meant to be experienced.",
          subtitle: h.heroSubtitle || "Comfortable stays, sattvik food and soulful darshan experiences for a more meaningful yatra.",
          textTone: "dark",
          image: h.heroImage,
        },
      ];
  const why = h.whyVhi?.length ? h.whyVhi : DEFAULT_WHY;
  const WHY_ICONS = [Home, HeartHandshake, UtensilsCrossed, Car];
  const wa = settings.business.whatsapp;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: `${settings.business.brandName} — VHI Luxury Homestays`,
          url: appUrl(),
          telephone: settings.business.phone,
          email: settings.business.email,
          address: { "@type": "PostalAddress", addressLocality: "Vrindavan", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
          image: heroImage?.url,
        }}
      />

      {/* ── Hero slider (Admin → Banners, placement “Homepage slider”) ── */}
      <HeroSlider
        slides={slides}
        whatsapp={settings.business.whatsapp}
        tours={tours.map((t) => ({ slug: t.slug, title: t.title, durationLabel: t.durationLabel, minGroupSize: t.minGroupSize ?? settings.booking.defaultMinGroupSize, advanceDays: t.advanceDays ?? settings.booking.defaultAdvanceDays }))}
      />

      {/* ── Trust strip ── */}
      {/* <section className="border-b border-black/5">
        <div className="container-x grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4 md:py-10">
          {[
            { icon: KeyRound, title: "Private homes", body: "Whole apartments & villas" },
            { icon: UtensilsCrossed, title: "Sattvik kitchen", body: "No onion, no garlic" },
            { icon: Mountain, title: "Darshan journeys", body: "Guided, all-inclusive" },
            { icon: HeartHandshake, title: "Local hosts", body: "On WhatsApp, always" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-umber">
                <f.icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{f.title}</span>
                <span className="block text-xs text-muted">{f.body}</span>
              </span>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── The experience ── */}
      {/* <section className="section">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <Photo media={h.introImage} alt="Vrindavan" className="aspect-square" sizes="(min-width:1024px) 45vw, 100vw" label="Vrindavan" />
            <div className="card absolute -bottom-6 right-4 max-w-[15rem] p-5 md:-right-6">
              <p className="text-sm font-semibold text-ink">Walk to darshan</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">Homes minutes from Prem Mandir, ISKCON and Banke Bihari.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-4">The experience</p>
            <h2 className="display text-[2rem] text-ink sm:text-4xl lg:text-[2.9rem]">{h.introTitle || "Vrindavan isn’t a place you visit. It’s a rhythm you fall into."}</h2>
            <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
              {(paragraphs(h.introBody).length
                ? paragraphs(h.introBody)
                : [
                    "Mangla aarti before dawn. The parikrama path at golden hour. Kirtan drifting from a courtyard you didn’t know was there.",
                    "VHI homes are built around that rhythm — close enough to walk to darshan, calm enough to come back to.",
                  ]
              ).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/stays" className="btn btn-primary">Find your stay</Link>
              <Link href="/about" className="btn btn-outline">Our story</Link>
            </div>
          </Reveal>
        </div>
      </section> */}

      {/* ── Three ways to stay (bento) ── */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Ways to experience Vrindavan" title="Choose how you’d" accent="like to arrive." />
            <p className="max-w-sm text-muted">Stay on your own terms, add home-cooked sattvik meals, or let us plan your whole yatra. Pick one to see it below.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
            {[
              { n: "01", title: "Stay", body: "Private studios, apartments and a four-bedroom villa for couples, families and satsang groups.", href: "#stays", image: featured[0]?.featuredImage, cta: "Explore stays" },
              { n: "02", title: "Stay + Sattvik Food", body: "Three, five or seven nights with fresh sattvik breakfast and dinner and a curated itinerary.", href: "#stay-food", image: packages[0]?.heroImage ?? h.foodImage, cta: "See packages" },
              { n: "03", title: "Darshan Tours", body: "Guided journeys through Vrindavan, Mathura, Govardhan and Barsana — everything included.", href: "#darshan", image: tours[0]?.heroImage, cta: "View journeys" },
            ].map((o, i) => (
              <Reveal key={o.n} delay={i * 100}>
                <Link href={o.href} className="group relative block overflow-hidden rounded-3xl bg-ink text-white">
                  <Photo media={o.image} alt={o.title} className="aspect-[4/5] !rounded-none" imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" sizes="(min-width:768px) 33vw, 100vw" label={o.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                  <span className="chip absolute left-5 top-5">{o.n}</span>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                    <h3 className="text-2xl font-semibold tracking-tight md:text-[1.7rem]">{o.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">{o.body}</p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition-transform duration-300 group-hover:translate-x-1">
                      {o.cta} <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

         {/* ── Featured stays ── */}
      {featured.length ? (
        <section id="stays" className="section scroll-mt-24 bg-paper">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="01 · Stays" title="Homes with a" accent="sense of place." />
              <Link href="/stays" className="btn btn-outline self-start md:self-auto">
                View all stays <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </div>
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((p, i) => (
                <Reveal key={p._id} delay={(i % 3) * 90}>
                  <PropertyCard p={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

     
      {/* ── Sattvik food ── */}
      <section id="stay-food" className="section scroll-mt-24">
        <div className="container-x">
          <div className="grid items-end gap-10 lg:grid-cols-2 lg:gap-20">
            <SectionHeading eyebrow="02 · Stay + Sattvik Food" title={h.foodTitle || "Home-cooked meals,"} accent={h.foodTitle ? undefined : "no onion, no garlic."} />
            <p className="text-[1.05rem] leading-relaxed text-muted">
              {paragraphs(h.foodBody)[0] ?? "Pure vegetarian, cooked fresh at home — dal, seasonal sabzi, phulkas and kheer. Add breakfast, or breakfast and dinner, to stays of three nights or more."}
            </p>
          </div>
          {packages.length ? (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {packages.slice(0, 3).map((p, i) => (
                <Reveal key={p._id} delay={i * 100}>
                  <PackageCard p={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Photo media={h.foodImage} alt="Sattvik food" className="mt-12 aspect-[21/9]" label="Sattvik food" />
          )}
          <Link href="/stay-food" className="btn btn-outline mt-10">
            All Stay + Food packages <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      {/* ── Darshan highlight (inset dark panel) ── */}
      {tours.length ? (
        <section id="darshan" className="scroll-mt-24 px-3 md:px-5">
          <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[2rem] bg-ink py-16 text-white md:rounded-[2.5rem] md:py-24">
            <div className="container-x">
              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <SectionHeading light eyebrow="03 · Darshan Tours" title="Walk the land of Krishna," accent="at the pace of devotion." intro="Unhurried, guided journeys across Braj — a VHI home each night, sattvik meals and a driver who knows every lane." />
                <div className="flex flex-wrap gap-2">
                  {[`Min. ${tours[0].minGroupSize} guests`, `Book ${tours[0].advanceDays}+ days ahead`, "Stay · meals · vehicle"].map((t) => (
                    <span key={t} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">{t}</span>
                  ))}
                </div>
              </div>
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {tours.slice(0, 3).map((t, i) => (
                  <Reveal key={t._id} delay={i * 100}>
                    <TourCard t={t} />
                  </Reveal>
                ))}
              </div>
              <Link href="/darshan-tours" className="btn btn-light mt-10">
                All journeys <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Temples & experiences ── */}
      {experiences.length ? (
        <section className="section bg-paper">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Around your stay" title="Temples, ghats" accent="& quiet corners." />
              <p className="max-w-sm text-muted">The places our guests love most — and the best time to see them.</p>
            </div>
            <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
              {experiences.map((e) => (
                <article key={e._id} className="group relative w-[72%] shrink-0 snap-start overflow-hidden rounded-3xl bg-ink text-white sm:w-[45%] md:w-auto">
                  <Photo media={e.image} alt={e.title} className="aspect-[3/4] !rounded-none" imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.05]" sizes="(min-width:768px) 25vw, 72vw" label={e.category} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                  {e.category ? <span className="chip absolute left-4 top-4">{e.category}</span> : null}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg font-semibold tracking-tight">{e.title}</h3>
                    {e.description ? <p className="mt-1.5 line-clamp-2 text-sm text-white/70">{e.description}</p> : null}
                    {e.bestTime ? <p className="mt-3 text-xs font-medium text-sand">Best time · {e.bestTime}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Add-on services ── */}
      {addOns.length ? (
        <section className="section border-t border-black/5">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Add-on services" title="We’ll handle" accent="the rest." intro="Add these while booking, or ask us on WhatsApp during your stay." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {addOns.slice(0, 6).map((a) => (
                <div key={a._id} className="flex gap-4 rounded-3xl border border-black/[0.06] p-6 transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(18,17,16,0.25)]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-umber">
                    <Icon name={a.icon} className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{a.name}</h3>
                    {a.description ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{a.description}</p> : null}
                    <p className="mt-3 text-sm font-semibold text-umber">
                      {a.pricingUnit === "on_request" || !a.price ? "On request" : `${formatINR(a.price)} ${a.pricingUnit.replace("per_", "/ ").replace("_", " ")}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Offers ── */}
      {offers.length ? (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Offers" title="A little more" accent="for longer stays." />
            <div className={cn("mt-12 grid gap-5", offers.length === 2 ? "md:grid-cols-2" : offers.length > 2 ? "md:grid-cols-3" : "")}>
              {offers.map((o) => (
                <div key={o._id} className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br from-paper to-linen p-8", offers.length === 1 && "md:flex md:items-end md:justify-between md:gap-10 md:p-12")}>
                  <div>
                    {o.badgeText ? <span className="chip !bg-ink !text-white">{o.badgeText}</span> : null}
                    <h3 className={cn("mt-5 font-semibold tracking-tight text-ink", offers.length === 1 ? "text-3xl md:text-4xl" : "text-2xl")}>{o.title || o.name}</h3>
                    {o.description ? <p className="mt-3 max-w-xl leading-relaxed text-muted">{o.description}</p> : null}
                  </div>
                  <div className={offers.length === 1 ? "mt-8 shrink-0 md:mt-0 md:text-right" : "mt-8"}>
                    {offers.length === 1 ? <Link href="/stays" className="btn btn-primary">Book now</Link> : null}
                    <p className={cn("text-xs font-medium text-umber", offers.length === 1 && "mt-3")}>Applied automatically at checkout{o.endsAt ? ` · until ${o.endsAt}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Why VHI ── */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Why VHI" title="Hospitality," accent="the Braj way." align="center" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w, i) => {
              const I = WHY_ICONS[i % WHY_ICONS.length];
              return (
                <Reveal key={i} delay={i * 90} className="rounded-3xl bg-paper p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-umber shadow-sm">
                    <I className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{w.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials.length ? (
        <section className="section bg-paper">
          <div className="container-x">
            <SectionHeading eyebrow="Guest stories" title="Stays that" accent="stayed with them." align="center" />
            <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {testimonials.slice(0, 3).map((t) => (
                <figure key={t._id} className="card flex w-[85%] shrink-0 snap-start flex-col justify-between p-7 md:w-auto">
                  <div>
                    <p className="flex gap-0.5 text-brass" aria-label={`${t.rating} out of 5`}>
                      {Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" strokeWidth={0} />)}
                    </p>
                    <blockquote className="mt-5 text-[1.05rem] leading-relaxed text-charcoal">“{t.text}”</blockquote>
                  </div>
                  <figcaption className="mt-8 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{t.guestName.charAt(0)}</span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t.guestName}</span>
                      <span className="block text-xs text-muted">{[t.city, t.stayedIn].filter(Boolean).join(" · ")}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Reels ── */}
      {reels.length ? <Reels reels={reels} instagram={settings.business.instagram} /> : null}

      {/* ── FAQ ── */}
      {faqs.length ? (
        <section className="section border-t border-black/5">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Questions" title="Good to" accent="know." />
              <Link href="/faq" className="btn btn-outline mt-8">All FAQs</Link>
            </div>
            <div className="lg:col-span-8">
              <FaqList items={faqs.slice(0, 6)} />
            </div>
          </div>
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.slice(0, 6).map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }} />
        </section>
      ) : null}

      {/* ── CTA ── */}
      <section className="px-3 py-16 md:px-5 md:py-24">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[2rem] bg-ink text-white md:rounded-[2.5rem]">
          <Photo media={heroImage} alt="" className="!absolute inset-0 h-full w-full !bg-ink" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25" />
          <div className="relative flex flex-col items-start justify-between gap-10 px-6 py-16 md:flex-row md:items-end md:px-16 md:py-24">
            <div>
              <p className="eyebrow !text-sand">Plan your visit</p>
              <h2 className="display mt-4 max-w-2xl text-4xl md:text-6xl">
                Your home in Vrindavan <span className="text-sand">is waiting.</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/stays" className="btn btn-light">Check availability</Link>
              {wa ? (
                <a href={whatsappLink(wa, "Radhe Radhe! I'd like help planning a stay in Vrindavan.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                  <MessageCircle className="h-4 w-4" strokeWidth={1.8} /> WhatsApp us
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
