import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Script from "next/script";
import ReviewsSection from "@/components/ReviewsSection";
import { site } from "@/lib/site";
import { LOAD_SIZES, formatCAD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Professional Movers in Ontario | Local & Long-Distance Moving",
  description:
    "Surftmove delivers reliable residential and commercial moving services across Ontario with upfront pricing and online booking. Get an instant quote today.",
  alternates: { canonical: "/" },
};

const features = [
  { icon: "🛡️", title: "Insured Move-Day Support", text: "Careful handling for homes, condos, offices, and long-distance Ontario routes." },
  { icon: "💲", title: "Transparent Pricing", text: "No hidden fees. Build a fast estimate online, then add the details that affect the real job." },
  { icon: "⏱️", title: "Fast Responses", text: "Reach us by phone, email, or form and get a prompt answer during business hours." },
  { icon: "📦", title: "Built for Real-World Moves", text: "Fragile items, heavy pieces, stairs, elevators, and long carries are all factored into planning." },
];

const steps = [
  { n: "1", title: "Get a Quote", text: "Use our instant calculator or request a custom estimate online." },
  { n: "2", title: "Book Your Date", text: "Pick a move date and tell us your origin, destination, and load size." },
  { n: "3", title: "We Handle the Rest", text: "Our crew arrives on time, loads, transports, and unloads with care." },
];

const services = [
  { title: "Residential Moving", text: "Apartments, condos, townhomes, and houses across Ontario.", icon: "🏠", href: "/services/residential-moving" },
  { title: "Long-Distance Moves", text: "Planned routes between cities and communities across Ontario.", icon: "🚚", href: "/services/long-distance-moving" },
  { title: "Commercial & Office", text: "Coordinated relocations for businesses and offices.", icon: "🏢", href: "/services/office-moving" },
  { title: "Packing Services", text: "Packing, wrapping, and preparation support for your move.", icon: "📦", href: "/services/packing-services" },
  { title: "Driver Help For Rental Vehicles", text: "Already rented the truck, van, pickup, or car? Request a driver and we will review availability.", icon: "🛻", href: "/driver-help" },
];

const heroBadges = [
  "Insured & Licensed",
  `Serving Ontario Since ${site.foundedYear}`,
  "Condo, Residential & Office Moves",
];

const trustPoints = [
  { stat: "Insured", label: "Licensed move-day support" },
  { stat: "Ontario-Wide", label: "Local & long-distance routes" },
  { stat: "Custom", label: "Quotes for fragile, heavy, and stair-heavy jobs" },
  { stat: "Direct", label: "Booking, billing, and follow-up online" },
];

const serviceRoutes = [
  { label: "Toronto condo and apartment moves", href: "/movers/toronto" },
  { label: "Barrie household and office relocations", href: "/movers/barrie" },
  { label: "Hamilton local and long-distance moves", href: "/movers/hamilton" },
  { label: "Moving services across major Ontario cities", href: "/movers" },
];

const driverSupportPoints = [
  "Request a driver for a rented moving truck, cargo van, pickup, or car",
  "Add driver help to a full move or book a driver-only request",
  "Share route details, dates, and vehicle notes in the dedicated driver-help form",
  "Route distance is filled in automatically once both addresses are entered",
];

const linkedCities = ["Barrie", "Toronto", "Mississauga", "Brampton", "Vaughan", "Markham", "Hamilton", "Kitchener"];

const heroImage = {
  src: "/surftmove-crew-hero.jpg",
  alt: "Surftmove movers carrying branded moving boxes inside a bright home",
};

const homeFaqs = [
  {
    q: "Do you handle both local and long-distance moves in Ontario?",
    a: "Yes. Surftmove helps with local moving within Ontario cities and longer routes between cities like Toronto, Ottawa, Kingston, Barrie, Hamilton, London, Mississauga, and Peterborough.",
  },
  {
    q: "Can I book a condo, apartment, or office move?",
    a: "Yes. The booking flow is built for condos, apartments, houses, townhomes, and office relocations, including stairs, elevator access, long carries, and higher pickup floors.",
  },
  {
    q: "How does your moving estimate work?",
    a: "The estimate combines load size, labour, and travel distance. Customers can also add fragile items, heavy pieces, packing help, and negotiation notes so the final bill can be reviewed before confirmation.",
  },
  {
    q: "Can I request a driver if I already rented the truck?",
    a: "Yes. Use the dedicated driver-help form if you already rented a truck, cargo van, pickup, or car and need a driver to help with the route.",
  },
  {
    q: "What happens after I submit a booking?",
    a: "The booking goes to the admin team for review. Once approved, the customer receives confirmation details, billing information, and the approved moving date by email.",
  },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: homeFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    {
      "@type": "ItemList",
      name: "Ontario cities served by Surftmove",
      itemListElement: site.primaryCities.map((city, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: city,
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Script
        id="home-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              🍁 Proudly serving all of Ontario
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Moving made simple, <span className="text-red-500">stress-free</span>, and affordable.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200">
              {site.name} helps with local and long-distance moves across Ontario with straightforward
              booking, custom quote review, and move-day planning built for real homes and buildings.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {heroBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/95 backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                Book Your Move
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg bg-white/10 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
              >
                Calculate Cost
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-300">
              Or call us directly:{" "}
              <a href={site.phoneHref} className="font-semibold text-white underline">
                {site.phone}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:px-6 md:grid-cols-4">
          {trustPoints.map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{item.stat}</p>
              <p className="mt-1 text-sm text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service area */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Where We Move</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Serving the Ontario cities customers actually search for.
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              Customers across Ontario need clear route and service information before they book.
              We support condo moves, household moves, office
              relocations, and longer intercity moves across the province.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {serviceRoutes.map((route) => (
                <Link key={route.href} href={route.href} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-red-400">
                  <p className="text-sm font-semibold text-slate-900">{route.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Popular Cities We Serve</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {linkedCities.map((city) => (
                <Link
                  key={city}
                  href={`/movers/${city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {city}
                </Link>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Need a route outside this list?</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We also handle custom Ontario routes beyond these featured cities. Use the booking form to
                price your distance and add move details for review.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Check Your Route
                </Link>
                <Link
                  href="/service-areas"
                  className="inline-flex rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  See Full Service Areas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why choose {site.shortName}?</h2>
          <p className="mt-3 text-slate-600">
            We combine professional crews, modern equipment, and honest pricing to make your next move
            the easiest one yet.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-2xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Our moving services</h2>
            <p className="mt-3 text-slate-600">Comprehensive solutions for every kind of move in Ontario.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <Link href={s.href} key={s.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-red-400 hover:shadow-sm">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-2xl">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Driver help */}
      <section id="driver-help" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Need A Driver?</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Already rented the truck or vehicle? We can review driver help too.
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              If you already have a rental truck, cargo van, pickup, or car and need someone to drive it,
              you can request driver support directly through the dedicated driver-help form. The route
              distance auto-calculates into the estimate box so we can review the trip details and prepare
              your estimate faster.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {driverSupportPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-300">Driver Help Requests</p>
            <h3 className="mt-3 text-2xl font-bold">Book driver support on its own dedicated form.</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-200">
              Choose `Move + driver help` if you want our crew and a driver for a rented vehicle, or choose
              `Driver help only` if the main thing you need is somebody to drive the rental for you.
            </p>
            <Link
              href="/driver-help"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Request Driver Help
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How it works</h2>
          <p className="mt-3 text-slate-600">Three simple steps from quote to move day.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Upfront pricing you can trust</h2>
            <p className="mt-3 text-slate-600">
              Starting rates by load size. Final cost is calculated by load + distance — try our calculator.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LOAD_SIZES.slice(0, 3).map((l) => (
              <div key={l.key} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{l.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{l.description}</p>
                <p className="mt-4 text-sm text-slate-500">starting from</p>
                <p className="text-3xl font-extrabold text-slate-900">{formatCAD(l.baseFee + l.hourlyRate * l.estHours)}</p>
                <p className="text-xs text-slate-500">+ travel & HST</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              See Full Pricing Calculator
            </Link>
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Moving FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Quick answers customers usually need before booking
          </h2>
          <p className="mt-3 text-slate-600">
            Clear answers help both customers and search engines understand exactly what services you
            offer, where you operate, and how the booking process works.
          </p>
        </div>
        <div className="mt-10 space-y-4">
          {homeFaqs.map((faq) => (
            <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-slate-900">
                <span>{faq.q}</span>
                <span className="text-red-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-14 text-center sm:px-6 md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready for a stress-free move?</h2>
            <p className="mt-2 text-red-100">Book online in minutes or call our friendly team today.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/booking"
              className="rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-red-600 shadow transition hover:bg-red-50"
            >
              Book a Move
            </Link>
            <a
              href={site.phoneHref}
              className="rounded-lg bg-red-700 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-red-800"
            >
              Call {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
