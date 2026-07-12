import type { Metadata } from "next";
import { Suspense } from "react";
import BookingThankYouCard from "@/components/BookingThankYouCard";
import BookingThankYouTracker from "@/components/BookingThankYouTracker";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your Surftmove booking request has been received.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/booking/thank-you" },
};

export default function BookingThankYouPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Suspense fallback={null}>
        <BookingThankYouTracker />
        <BookingThankYouCard />
      </Suspense>
    </section>
  );
}
