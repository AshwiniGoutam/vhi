import type { Metadata } from "next";
import { PackageCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { FaqList } from "@/components/site/faq-list";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listBanners, listFaqs, listMealPlans, listPackages } from "@/server/services/catalog.service";
import { HeroSlider, type HeroSlide } from "@/components/site/hero-slider";
import { getSettings } from "@/server/services/settings.service";
import { buildMetadata } from "@/lib/seo";
import { formatINR } from "@/lib/money";
import { paragraphs } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Stay + Sattvik Food Packages",
  description: "Three, five or seven nights in a private VHI home with freshly cooked sattvik breakfast and dinner, and a curated Vrindavan itinerary.",
  path: "/stay-food",
});

export default async function StayFoodPage() {
  const [packages, meals, faqs, settings, banners] = await Promise.all([listPackages(), listMealPlans(), listFaqs({ category: "stay_food" }), getSettings(), listBanners("stay_food")]);
  const h = settings.home;

  // Admin → Banners (placement "Stay + Food page"); falls back to this copy + the Sattvik food photo.
  const slides: HeroSlide[] = banners.length
    ? banners.map((b) => ({ id: b._id, eyebrow: b.eyebrow, title: b.title, titleAccent: b.titleAccent, subtitle: b.subtitle, textTone: b.textTone, image: b.image, mobileImage: b.mobileImage, video: b.video, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref }))
    : [
        {
          id: "stay-food-default",
          eyebrow: "Stay + Sattvik Food",
          title: "Stay, eat,",
          titleAccent: "slow down.",
          subtitle: paragraphs(h.foodBody)[0] ?? "A private home, sattvik meals cooked fresh each day, and an itinerary that leaves room for the unplanned.",
          textTone: "dark",
          image: h.foodImage ?? packages.find((p) => p.heroImage?.url)?.heroImage,
        },
      ];
  const lightTop = (slides[0].textTone ?? "dark") === "light";

  return (
    <>
      <HeroSlider variant="page" slides={slides} top={<Breadcrumbs light={lightTop} items={[{ label: "Home", href: "/" }, { label: "Stay + Food" }]} />}>
        {packages.length ? (
          <div className="flex flex-wrap gap-2">
            {packages.map((p) => (
              <Link key={p._id} href={`/stay-food/${p.slug}`} className="group flex items-center gap-3 rounded-full border border-black/5 bg-white py-2 pl-2 pr-5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{p.nights}</span>
                <span className="text-sm font-semibold text-ink">{p.nights} nights</span>
                <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-ink" strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        ) : (
          <></>
        )}
      </HeroSlider>

      <section className="border-t hairline bg-paper py-20 md:py-28">
        <div className="container-x">
          <p className="eyebrow">Packages</p>
          {packages.length ? (
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {packages.map((p, i) => (
                <Reveal key={p._id} delay={i * 100}>
                  <PackageCard p={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-muted">Packages are being prepared — message us to plan a stay with meals.</p>
          )}
        </div>
      </section>

      {meals.length ? (
        <section className="container-x py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Meal plans</p>
              <h2 className="display mt-4 text-4xl text-ink md:text-5xl">Add meals to <span className="accent">any stay.</span></h2>
            </div>
            <div className="grid gap-px bg-charcoal/10 md:grid-cols-2 lg:col-span-8">
              {meals.map((m) => (
                <div key={m._id} className="bg-ivory p-8">
                  <h3 className="display text-3xl text-ink">{m.name}</h3>
                  {m.description ? <p className="mt-3 text-muted">{m.description}</p> : null}
                  <p className="mt-6 text-sm text-charcoal">
                    {formatINR(m.adultPrice)} per adult{m.pricingModel === "per_person_per_night" ? " per night" : ""}
                    {m.childPrice ? ` · ${formatINR(m.childPrice)} per child (${m.childAgeMin}–${m.childAgeMax})` : ""}
                  </p>
                  <p className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-umber">Stays of {m.nightsRule === "gt" ? `more than ${m.minNights}` : `${m.minNights}+`} nights</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="container-x pb-24">
          <FaqList items={faqs} />
        </section>
      ) : null}
    </>
  );
}
