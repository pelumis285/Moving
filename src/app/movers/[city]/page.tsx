import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingCta from "@/components/MarketingCta";
import SeoJsonLd from "@/components/SeoJsonLd";
import { cityBySlug, cityPages, servicePages } from "@/lib/seo-pages";
import { site } from "@/lib/site";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return cityPages.map(({ slug }) => ({ city: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = cityBySlug.get(slug);
  if (!city) return {};
  const canonical = `/movers/${city.slug}`;
  return {
    title: city.title,
    description: city.description,
    alternates: { canonical },
    openGraph: { title: `${city.title} | ${site.name}`, description: city.description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title: `${city.title} | ${site.name}`, description: city.description },
  };
}

const process = [
  ["1", "Describe your move", "Send the origin, destination, date, load size, and access details."],
  ["2", "Review the quote", "We review travel, labour, and special-handling requirements before confirmation."],
  ["3", "Prepare for move day", "Confirm building access, parking, elevator times, and the items being moved."],
];

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = cityBySlug.get(slug);
  if (!city) notFound();

  const canonical = `${site.url}/movers/${city.slug}`;
  const faqs = [
    { q: `Does Surftmove handle local moves in ${city.name}?`, a: `Yes. You can request a quote for an eligible move within ${city.name} by providing both addresses, the load size, and access details.` },
    { q: `Can I move from ${city.name} to another Ontario city?`, a: "Yes. Submit the complete origin and destination so the route, travel, labour, and schedule can be reviewed." },
    { q: "What details make a moving quote more accurate?", a: "Include floors, stairs, elevators, parking, long carries, fragile or heavy items, packing needs, and any building time restrictions." },
    { q: "Is a submitted date automatically confirmed?", a: "No. A request is reviewed before the final quote and moving date are confirmed." },
  ];
  const schemas = [
    { "@context": "https://schema.org", "@type": "Service", name: `Moving services in ${city.name}, Ontario`, serviceType: "Moving service", provider: { "@type": "MovingCompany", name: site.name, url: site.url, telephone: site.phone }, areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "AdministrativeArea", name: "Ontario" } }, url: canonical, description: city.description },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site.url }, { "@type": "ListItem", position: 2, name: "Ontario Movers", item: `${site.url}/movers` }, { "@type": "ListItem", position: 3, name: city.name, item: canonical }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
  ];

  return (
    <>
      <SeoJsonLd data={schemas} />
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-300"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/movers">Movers</Link> <span aria-hidden="true">/</span> {city.name}</nav>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">Movers in {city.name}, Ontario</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-200">{city.intro}</p>
          <Link href="/booking" className="mt-7 inline-flex rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">Get a {city.name} Moving Quote</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 p-6"><h2 className="text-2xl font-bold text-slate-900">Residential moving in {city.name}</h2><p className="mt-3 leading-relaxed text-slate-600">We help plan moves for houses and townhomes using the route, load size, property access, and items that need special handling. {city.localPlanning}</p><Link href="/services/residential-moving" className="mt-4 inline-flex font-semibold text-red-600">Explore residential moving →</Link></article>
        <article className="rounded-2xl border border-slate-200 p-6"><h2 className="text-2xl font-bold text-slate-900">Apartment and condo moves</h2><p className="mt-3 leading-relaxed text-slate-600">{city.apartmentNote}</p><Link href="/services/apartment-condo-moving" className="mt-4 inline-flex font-semibold text-red-600">Apartment and condo moving →</Link></article>
        <article className="rounded-2xl border border-slate-200 p-6"><h2 className="text-2xl font-bold text-slate-900">Office and commercial moving</h2><p className="mt-3 leading-relaxed text-slate-600">{city.commercialNote}</p><Link href="/services/office-moving" className="mt-4 inline-flex font-semibold text-red-600">Office moving services →</Link></article>
        <article className="rounded-2xl border border-slate-200 p-6"><h2 className="text-2xl font-bold text-slate-900">Long-distance moves from {city.name}</h2><p className="mt-3 leading-relaxed text-slate-600">Moving to another Ontario community? Provide the complete route, preferred date, load, and delivery access so travel and scheduling can be reviewed.</p><Link href="/services/long-distance-moving" className="mt-4 inline-flex font-semibold text-red-600">Long-distance moving →</Link></article>
      </section>

      <section className="bg-slate-50 py-14"><div className="mx-auto max-w-6xl px-4 sm:px-6"><h2 className="text-center text-3xl font-bold text-slate-900">How your {city.name} move works</h2><div className="mt-9 grid gap-6 md:grid-cols-3">{process.map(([n, title, text]) => <article key={n} className="rounded-2xl bg-white p-6 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 font-bold text-white">{n}</span><h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></article>)}</div></div></section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><h2 className="text-3xl font-bold text-slate-900">Why choose Surftmove for your move?</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><p className="rounded-xl border border-slate-200 p-5 text-slate-600">Quote requests reflect your route, load, access, and handling needs.</p><p className="rounded-xl border border-slate-200 p-5 text-slate-600">Local, residential, commercial, packing, and Ontario long-distance options.</p><p className="rounded-xl border border-slate-200 p-5 text-slate-600">Online booking with room for building rules and budget notes.</p><p className="rounded-xl border border-slate-200 p-5 text-slate-600">Direct contact by phone, email, or the website form.</p></div></section>

      <section className="bg-slate-50"><div className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><h2 className="text-3xl font-bold text-slate-900">{city.name} moving FAQs</h2><div className="mt-7 space-y-4">{faqs.map((faq) => <details key={faq.q} className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-semibold text-slate-900">{faq.q}</summary><p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p></details>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><h2 className="text-2xl font-bold text-slate-900">Services and nearby moving areas</h2><div className="mt-5 flex flex-wrap gap-3">{servicePages.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-red-500 hover:text-red-600">{service.name}</Link>)}{city.nearby.map((nearbySlug) => { const nearby = cityBySlug.get(nearbySlug); return nearby ? <Link key={nearby.slug} href={`/movers/${nearby.slug}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-red-500 hover:text-red-600">Movers in {nearby.name}</Link> : null; })}</div></section>
      <MarketingCta heading={`Planning a move in ${city.name}?`} />
    </>
  );
}
