import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Surftmove, our moving approach, our service values, and how we help customers across Ontario with transparent planning and careful handling.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Clear communication",
    text: "We keep the moving process simple: straightforward quote discussions, clear scheduling, and honest updates when details change.",
  },
  {
    title: "Careful handling",
    text: "Fragile items, heavy furniture, and awkward access points all get planned for before move day so the crew arrives prepared.",
  },
  {
    title: "Flexible quoting",
    text: "Every move is different. We combine a fast base estimate with custom quote factors so pricing reflects the real job, not guesswork.",
  },
];

const servicePoints = [
  "Local residential moves across Ontario",
  "Long-distance moves between Ontario cities",
  "Office and commercial relocations",
  "Packing help and move-day coordination",
  "Custom quote reviews for special handling or access needs",
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">About {site.name}</h1>
          <p className="mt-3 text-slate-300">
            A practical moving company focused on careful handling, honest pricing, and smooth planning
            across Ontario.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Who We Are</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Built for customers who want a well-planned move, not surprises.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
              <p>
                {site.name} was built around one simple idea: moving should feel organized, transparent,
                and manageable from the first quote conversation to the final box on move day.
              </p>
              <p>
                Some customers need a quick local move. Others have fragile pieces, heavy furniture, long
                carry distances, stairs, building restrictions, or budget concerns that make the job more
                complex. We created the website and admin workflow to handle both situations properly.
              </p>
              <p>
                That means customers can request a straightforward booking, submit a more detailed quote
                request, or explain where they need flexibility so the final bill can be reviewed before the
                move is confirmed.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-slate-900">Service Focus</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {servicePoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-0.5 text-red-600">&bull;</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Need a custom quote?</p>
              <p className="mt-2 text-sm text-slate-600">
                Use the booking form to add fragile item counts, heavy items, stair access, packing help,
                and your target budget.
              </p>
              <Link
                href="/booking#custom-quote"
                className="mt-4 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Open Custom Quote Section
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How We Work</h2>
            <p className="mt-3 text-slate-600">
              Our process is designed to keep expectations clear for both the customer and the moving team.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="rounded-3xl bg-red-600 px-6 py-10 text-center text-white shadow-lg sm:px-10">
          <h2 className="text-3xl font-bold">Ready to plan your move?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-red-100">
            Start with an instant estimate, then add the details that matter for your job so we can confirm
            the right quote and moving date.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/booking"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Book a Move
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-red-800"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
