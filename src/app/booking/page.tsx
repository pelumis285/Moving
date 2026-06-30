import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book Your Move",
  description:
    "Book your move with Surftmove. Request a standard booking or add custom quote details like fragile items, heavy pieces, and budget notes before your move is confirmed.",
  alternates: { canonical: "/booking" },
};

export default function BookingPage() {
  return (
    <>
      <section className="bg-slate-900 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Book Your Move</h1>
          <p className="mt-3 text-slate-300">
            Tell us about your move and we&apos;ll review your booking, custom quote details, and final
            pricing before confirmation. Need help? Call{" "}
            <a href={site.phoneHref} className="font-semibold text-white underline">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <BookingForm />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500">
          By submitting this form your details are sent securely to our moving coordinators. We never share
          your information with third parties.
        </p>
      </section>
    </>
  );
}
