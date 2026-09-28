import type { Metadata } from "next";
import { TourCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { EnquiryForm } from "@/components/booking/enquiry-form";
import { FaqList } from "@/components/site/faq-list";
import { listBanners, listFaqs, listTours } from "@/server/services/catalog.service";
import { HeroSlider, type HeroSlide } from "@/components/site/hero-slider";
import { getSettings } from "@/server/services/settings.service";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Darshan Tours in Vrindavan & Braj",
  description: "Guided Darshan journeys through Vrindavan, Mathura, Govardhan, Barsana and Nandgaon — stay, sattvik meals, vehicle and guide included.",
  path: "/darshan-tours",
});

export default async function DarshanToursPage() {
  const [tours, faqs, settings, banners] = await Promise.all([listTours(), listFaqs({ category: "darshan" }), getSettings(), listBanners("darshan")]);
  const minGroup = tours[0]?.minGroupSize ?? settings.booking.defaultMinGroupSize;
  const advanceDays = tours[0]?.advanceDays ?? settings.booking.defaultAdvanceDays;

  // Admin → Banners (placement "Darshan page"); falls back to this copy + the first tour's photo.
  const slides: HeroSlide[] = banners.length
    ? banners.map((b) => ({ id: b._id, eyebrow: b.eyebrow, title: b.title, titleAccent: b.titleAccent, subtitle: b.subtitle, textTone: b.textTone, image: b.image, mobileImage: b.mobileImage, video: b.video, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref }))
    : [
        {
          id: "darshan-default",
          eyebrow: "Darshan Tours",
          title: "Journeys through Braj,",
          titleAccent: "at the pace of devotion.",
          subtitle: "Every tour includes a VHI home, sattvik meals, a private vehicle with a local driver, and temple timings planned around aarti — not traffic.",
          textTone: "light",
          image: tours.find((t) => t.heroImage?.url)?.heroImage,
        },
      ];
  const lightTop = (slides[0].textTone ?? "dark") === "light";

  return (
    <>
      <HeroSlider
        variant="page"
        slides={slides}
        whatsapp={settings.business.whatsapp}
        searchTab="darshan"
        tours={tours.map((t) => ({ slug: t.slug, title: t.title, durationLabel: t.durationLabel, minGroupSize: t.minGroupSize ?? minGroup, advanceDays: t.advanceDays ?? advanceDays }))}
        top={<Breadcrumbs light={lightTop} items={[{ label: "Home", href: "/" }, { label: "Darshan Tours" }]} />}
      />

      <section className="border-b border-black/5">
        <div className="container-x flex flex-wrap gap-2 py-6">
          {[`Min. ${minGroup} guests`, `Book ${advanceDays}+ days ahead`, "Stay · sattvik meals · vehicle · guide", "Pickup from Mathura"].map((t) => (
            <span key={t} className="rounded-full bg-paper px-4 py-2 text-sm text-charcoal">{t}</span>
          ))}
        </div>
      </section>

      <section className="container-x py-20 md:py-28">
        {tours.length ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((t, i) => (
              <Reveal key={t._id} delay={(i % 3) * 100}>
                <TourCard t={t} />
                <ul className="mt-5 space-y-2 text-sm text-muted">
                  {(t.highlights ?? []).slice(0, 3).map((h) => <li key={h}>· {h}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">New journeys are being prepared. Enquire below and we&apos;ll plan one for you.</p>
        )}
      </section>

      <section className="border-t hairline bg-paper py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Custom journeys</p>
            <h2 className="display mt-5 text-4xl text-ink md:text-5xl">Planning something <span className="accent">different?</span></h2>
            <p className="mt-5 text-muted">Larger groups, elderly parents, a specific festival, Govardhan parikrama on foot — tell us and we&apos;ll shape the days around you.</p>
          </div>
          <div className="lg:col-span-8">
            <EnquiryForm type="custom_tour" subject="Custom Darshan tour" />
          </div>
        </div>
      </section>

      {faqs.length ? (
        <section className="container-x py-20">
          <h2 className="display mb-10 text-4xl text-ink">Darshan tour questions</h2>
          <FaqList items={faqs} />
        </section>
      ) : null}
    </>
  );
}
