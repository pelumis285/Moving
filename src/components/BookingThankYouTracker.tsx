"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const BOOKING_CONVERSION_STORAGE_KEY = "surftmove-last-booking-conversion";
const MAX_CONVERSION_AGE_MS = 15 * 60 * 1000;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type StoredBookingConversion = {
  bookingId: number | null;
  bookingValue: number | null;
  createdAt: number;
};

function parseStoredBookingConversion(value: string | null): StoredBookingConversion | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredBookingConversion>;
    if (typeof parsed.createdAt !== "number") {
      return null;
    }

    return {
      bookingId: typeof parsed.bookingId === "number" ? parsed.bookingId : null,
      bookingValue: typeof parsed.bookingValue === "number" ? parsed.bookingValue : null,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export default function BookingThankYouTracker() {
  const searchParams = useSearchParams();
  const bookingIdFromUrl = Number(searchParams.get("booking"));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = parseStoredBookingConversion(window.sessionStorage.getItem(BOOKING_CONVERSION_STORAGE_KEY));
    if (!stored) {
      window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
      return;
    }

    if (Date.now() - stored.createdAt > MAX_CONVERSION_AGE_MS) {
      window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
      return;
    }

    if (
      Number.isFinite(bookingIdFromUrl) &&
      stored.bookingId != null &&
      bookingIdFromUrl > 0 &&
      stored.bookingId !== bookingIdFromUrl
    ) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "booking_submission_success",
      bookingId: stored.bookingId,
      conversionValue: stored.bookingValue,
      conversionCurrency: "CAD",
    });
    window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
  }, [bookingIdFromUrl]);

  return null;
}
