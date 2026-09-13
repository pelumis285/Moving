import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ontario Service Areas",
  description:
    "Explore the Ontario cities and route types Surftmove supports, including Toronto, Ottawa, Kingston, Barrie, London, Hamilton, Peterborough, and Mississauga.",
  alternates: { canonical: "/service-areas" },
};

const cityHighlights = [
  {
    city: "Toronto",
    title: "Toronto condo and apartment moves",
    text: "Downtown buildings, condo move coordination, elevator timing, and apartment routes across Toronto and the GTA.",
  },
  {
    city: "Ottawa",
    title: "Ottawa household and office relocations",
    text: "Home moves, office relocations, and longer routes connecting Ottawa with the rest of Ontario.",
  },
  {
    city: "Kingston",
    title: "Kingston local and intercity moves",
    text: "Great for household moves, student-related routes, and Kingston-to-Toronto or Kingston-to-Ottawa trips.",
  },
  {
    city: "Mississauga",
    title: "Mississauga family and condo moves",
    text: "Residential and condo moves throughout Mississauga with custom quote handling for stairs, towers, and larger furniture.",
  },
  {
    city: "Hamilton",
    title: "Hamilton residential and business moves",
    text: "Apartment, household, and office moving support with route planning for both local and longer Ontario trips.",
  },
  {
    city: "London",
    title: "London local and long-distance support",
    text: "Household moves within London plus longer bookings connecting Southwestern Ontario to other major cities.",
  },
  {
    city: "Barrie",
    title: "Barrie and Simcoe County routes",
    text: "Great for Barrie customers who need local moving help or longer routes toward Toronto, Ottawa, or Kingston.",
  },
  {
    city: "Peterborough",
    title: "Peterborough custom moving routes",
    text: "Moving support for homes and longer trips when customers need careful handling, flexible quotes, and route planning.",
  },
];

const routeExamples = [
  "Toronto to Ottawa",
  "Kingston to Toronto",
  "Barrie to Ottawa",
  "Mississauga to London",
  "Hamilton to Kingston",
  "Ottawa to Peterborough",
];

const faqs = [
  {
    q: "Do you only serve the cities listed on this page?",
    a: "No. These are the main Ontario cities we highlight for customers and search visibility, but Surftmove can still review custom routes across Ontario beyond this list.",
  },
  {
    q: "Can you help with routes between Ontario cities?",
    a: "Yes. We handle both local moves and longer routes between cities, including condo, apartment, household, and office moves.",
  },
  {
    q: "Can I request a custom quote for a condo or higher floor move?",
    a: "Yes. The booking form includes fields for condo or storey-building access, the floor you are carrying from, stair flights, elevator access, and other price-driving details.",
  },
  {
    q: "How do I check if my route is covered?",
    a: "Use the booking form or pricing calculator with your origin and destination. The route distance is estimated automatically, and the admin team can review the move details before confirmation.",
  },
];

const serviceAreasJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Ontario moving service areas",
      provider: {
        "@id": `${site.url}#moving-company`,
      },
      areaServed: site.primaryCities.map((city) => ({
        "@type": "City",
        name: city,
      })),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Featured Ontario routes",
        itemListElement: routeExamples.map((route) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: route,
          },
        })),
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ],
};

export default function ServiceAreasPage() {
  return (
    <>
      <Script
        id="service-areas-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreasJsonLd) }}
      />

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Ontario Coverage</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
            Service areas built around the Ontario cities customers search for most.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Surftmove supports local and long-distance moves across Ontario, with strong coverage for condo,
            apartment, household, office, and custom quote routes in major cities and intercity corridors.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {cityHighlights.map((item) => (
            <article key={item.city} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">{item.city}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Popular Route Types</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Local city moves and longer Ontario routes
              </h2>
              <p className="mt-4 max-w-2xl text-slate-600">
                Customers often search by city pair or route type, not just by company name. This page helps
                explain the kinds of routes and building situations your team is ready to review.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {routeExamples.map((route) => (
                  <span
                    key={route}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    {route}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-xl font-bold text-slate-900">What customers can include in the quote</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li>Condo or storey-building pickup details</li>
                <li>The floor items are being carried from</li>
                <li>Fragile and heavy item counts</li>
                <li>Stair flights, elevator access, and long carries</li>
                <li>Packing help, assembly help, and budget notes</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Book a Move
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open Pricing Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Service Area FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Questions people ask before booking an Ontario move
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                <span>{faq.q}</span>
                <span className="text-red-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
