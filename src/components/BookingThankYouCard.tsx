"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BookingThankYouCard() {
  const searchParams = useSearchParams();
  const bookingReference = searchParams.get("booking");

  return (
    <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-green-600 text-3xl text-white">
        ✓
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Thank You</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
        Your booking request has been submitted successfully. Our team will review your move details,
        quote factors, and requested date before sending confirmation.
      </p>
      {bookingReference ? (
        <p className="mt-5 text-sm font-semibold text-slate-700">Booking reference: #{bookingReference}</p>
      ) : null}
      <p className="mt-4 text-sm text-slate-500">
        Keep an eye on your email. If your booking is approved, you will receive your confirmation details,
        billing information, and next steps there.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
