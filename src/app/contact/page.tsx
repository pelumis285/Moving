import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Surftmove. Call us, email us, or send a message and our team will respond quickly. Serving all of Ontario.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-slate-300">
            Questions about your move? We&apos;re here to help — reach out any time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact details */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Get in touch</h2>
            <p className="mt-2 text-slate-600">
              Call us for an immediate quote or send a message and we&apos;ll respond within a few hours
              during business hours.
            </p>

            <div className="mt-8 space-y-5">
              <a
                href={site.phoneHref}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-2xl">📞</div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="text-lg font-semibold text-slate-900">{site.phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${site.publicEmail}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-2xl">✉️</div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-lg font-semibold text-slate-900">{site.publicEmail}</p>
                </div>
              </a>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-2xl">📍</div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="text-base font-semibold text-slate-900">{site.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-2xl">🕒</div>
                <div>
                  <p className="text-sm text-slate-500">Hours</p>
                  <p className="text-base font-semibold text-slate-900">{site.hours}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Popular Ontario cities we serve</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {site.primaryCities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {city}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Need a different route? We still cover moves across Ontario beyond this featured city list.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Send a message</h2>
            <p className="mt-1 text-sm text-slate-600">We&apos;ll reply by email or phone.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
