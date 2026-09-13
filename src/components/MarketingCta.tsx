import Link from "next/link";
import { site } from "@/lib/site";

export default function MarketingCta({ heading = "Ready to plan your move?" }: { heading?: string }) {
  return (
    <section className="bg-red-600">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 md:flex-row md:text-left">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2>
          <p className="mt-2 text-red-100">Share your route and move details for a clear quote review.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/booking" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">Book Your Move</Link>
          <Link href="/contact" className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-red-800">Get a Quote</Link>
          <a href={site.phoneHref} className="rounded-lg px-3 py-3 text-sm font-semibold text-white underline">Call {site.phone}</a>
        </div>
      </div>
    </section>
  );
}
