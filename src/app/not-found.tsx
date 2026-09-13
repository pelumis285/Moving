import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-slate-900">This page could not be found</h1>
      <p className="mx-auto mt-4 max-w-xl text-slate-600">
        The address may have changed. Choose a moving service, find your Ontario service area, or return home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Return Home</Link>
        <Link href="/services" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-red-500">View Services</Link>
        <Link href="/movers" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-red-500">View Locations</Link>
      </div>
    </section>
  );
}
