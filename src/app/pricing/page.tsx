import type { Metadata } from "next";
import Link from "next/link";
import PricingCalculator from "@/components/PricingCalculator";
import { LOAD_SIZES, formatCAD, PER_KM_RATE, FREE_KM, HST_RATE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Moving Cost Calculator & Pricing",
  description:
    "Transparent moving prices across Ontario. Use our instant calculator to estimate your moving cost based on load size and distance. No hidden fees.",
  alternates: { canonical: "/pricing" },
};

const faqs = [
  {
    q: "How is my moving cost calculated?",
    a: "Your estimate combines a base handling fee, labour (movers × hours at our hourly rate), and travel charges based on distance. Ontario HST (13%) is then applied.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. The estimate you see is what you pay, assuming your move details are accurate. Any changes are discussed and approved before work begins.",
  },
  {
    q: "What's included in the travel charge?",
    a: `The first ${FREE_KM} km are free. Beyond that we charge a flat ${formatCAD(PER_KM_RATE)} per km to cover fuel and travel time.`,
  },
  {
    q: "Do you offer packing supplies?",
    a: "Yes — boxes, tape, and wrapping materials are available, and our crews can fully pack your home on request.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Transparent Moving Prices</h1>
          <p className="mt-3 text-slate-300">
            No surprises, no hidden fees. Estimate your cost instantly based on load size and distance.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <PricingCalculator />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:pb-16">
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Alternative Quote Section</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              Need a more tailored quote than the instant calculator?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              On the booking page you can now add specific price-driving details like fragile item counts,
              heavy or oversized pieces, condo or storey-building pickup access, the floor we are carrying
              from, stair access, packing help, long-carry access, and your target budget. There is also
              room to explain where you want us to negotiate the quote.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Good for moves with:</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Fragile items or specialty handling</li>
              <li>Heavy furniture or oversized appliances</li>
              <li>Condos, walk-ups, or higher pickup floors</li>
              <li>Extra stairs, difficult access, or long carries</li>
              <li>Packing help or furniture assembly needs</li>
              <li>A budget range you want us to work around</li>
            </ul>
            <Link
              href="/booking#custom-quote"
              className="mt-5 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Open Custom Quote Form
            </Link>
          </div>
        </div>
      </section>

      {/* Rate table */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">Rates by load size</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Travel is {formatCAD(PER_KM_RATE)}/km after the first {FREE_KM} km. All prices subject to{" "}
            {Math.round(HST_RATE * 100)}% HST.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-5 py-3 font-semibold">Load Size</th>
                  <th className="px-5 py-3 font-semibold">Crew</th>
                  <th className="px-5 py-3 font-semibold">Base Fee</th>
                  <th className="px-5 py-3 font-semibold">Hourly Rate</th>
                  <th className="px-5 py-3 font-semibold">Typical Labour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {LOAD_SIZES.map((l) => (
                  <tr key={l.key} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{l.label}</div>
                      <div className="text-xs text-slate-500">{l.description}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{l.movers} movers</td>
                    <td className="px-5 py-4 text-slate-700">{formatCAD(l.baseFee)}</td>
                    <td className="px-5 py-4 text-slate-700">{formatCAD(l.hourlyRate)}/hr</td>
                    <td className="px-5 py-4 text-slate-700">~{l.estHours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">Pricing FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                {f.q}
                <span className="ml-4 text-red-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/booking"
            className="rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Book My Move
          </Link>
        </div>
      </section>
    </>
  );
}
