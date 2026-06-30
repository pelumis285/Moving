import type { Metadata } from "next";
import { Suspense } from "react";
import RescheduleMoveDateForm from "@/components/RescheduleMoveDateForm";

export const metadata: Metadata = {
  title: "Change Moving Date",
  robots: { index: false, follow: false },
};

export default function ReschedulePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Change Your Moving Date</h1>
        <p className="mt-3 text-slate-600">
          Use the secure link from your confirmation email to request a new date for your move.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-slate-600">Loading your booking...</p>}>
            <RescheduleMoveDateForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
