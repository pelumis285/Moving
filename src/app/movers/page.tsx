import type { Metadata } from "next";
import Link from "next/link";
import { cityPages } from "@/lib/seo-pages";

export const metadata: Metadata = { title: "Ontario Movers by City", description: "Find Surftmove moving services in Barrie, Toronto, the GTA, Durham, Hamilton, Waterloo Region and other Ontario communities.", alternates: { canonical: "/movers" } };

export default function MoversIndexPage() {
  return <><section className="bg-slate-900 py-14 text-center text-white"><div className="mx-auto max-w-3xl px-4"><h1 className="text-4xl font-extrabold">Moving Services Across Ontario</h1><p className="mt-4 text-slate-300">Choose your city for local planning information, relevant services, and a route-based quote.</p></div></section><section className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cityPages.map((city) => <Link key={city.slug} href={`/movers/${city.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-900 shadow-sm hover:border-red-400 hover:text-red-600">Movers in {city.name}<span className="mt-2 block text-sm font-normal text-slate-500">Local and Ontario routes →</span></Link>)}</div></section></>;
}
