import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Driver Help",
  description:
    "Request driver help from Surftmove if you already rented a truck, van, pickup, or car. Book move plus driver help or driver-only support with a distance-based estimate.",
  alternates: { canonical: "/driver-help" },
};

export default function DriverHelpPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Driver Help</h1>
          <p className="mt-3 text-slate-300">
            Already rented the truck, van, pickup, or car? Request `Move + driver help` or `Driver help only`
            with a distance-based estimate tied to the route you enter. Need help now? Call{" "}
            <a href={site.phoneHref} className="font-semibold text-white underline">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <BookingForm mode="driver-help" />
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Want To Drive With Us?</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Drivers can create a profile and set their own rate.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              If you want to work with {site.name} as a driver, you can now create your driver profile,
              set your preferred price per kilometre, and submit your details for admin approval.
            </p>
            <Link
              href="/drive-with-us"
              className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create Driver Profile
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500">
          Driver-help estimates use the auto-calculated trip distance. We still review every request before
          confirmation to make sure timing, vehicle details, and route plans are correct.
        </p>
      </section>
    </>
  );
}
