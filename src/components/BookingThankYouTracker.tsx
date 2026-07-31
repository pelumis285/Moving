"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const BOOKING_CONVERSION_STORAGE_KEY = "surftmove-last-booking-conversion";
const META_TRACKED_CONVERSION_KEY = "surftmove-last-meta-booking-conversion";
const MAX_CONVERSION_AGE_MS = 15 * 60 * 1000;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
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

function getTrackingKey(stored: StoredBookingConversion | null, bookingIdFromUrl: number) {
  if (Number.isFinite(bookingIdFromUrl) && bookingIdFromUrl > 0) {
    return `booking:${bookingIdFromUrl}`;
  }

  if (stored?.bookingId != null) {
    return `booking:${stored.bookingId}`;
  }

  if (stored?.createdAt != null) {
    return `created:${stored.createdAt}`;
  }

  return null;
}

export default function BookingThankYouTracker() {
  const searchParams = useSearchParams();
  const bookingIdFromUrl = Number(searchParams.get("booking"));
  const tracked = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tracked.current) return;

    let stored = parseStoredBookingConversion(window.sessionStorage.getItem(BOOKING_CONVERSION_STORAGE_KEY));
    if (stored && Date.now() - stored.createdAt > MAX_CONVERSION_AGE_MS) {
      window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
      stored = null;
    }

    if (
      Number.isFinite(bookingIdFromUrl) &&
      stored?.bookingId != null &&
      bookingIdFromUrl > 0 &&
      stored.bookingId !== bookingIdFromUrl
    ) {
      return;
    }

    const trackingKey = getTrackingKey(stored, bookingIdFromUrl);
    if (!trackingKey) {
      window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
      return;
    }

    if (window.sessionStorage.getItem(META_TRACKED_CONVERSION_KEY) === trackingKey) {
      window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
      return;
    }

    const resolvedBookingId =
      Number.isFinite(bookingIdFromUrl) && bookingIdFromUrl > 0
        ? bookingIdFromUrl
        : stored?.bookingId ?? null;

    const metaConversionPayload: Record<string, unknown> = {
      content_name: "Moving Booking Completed",
      content_category: "Booking",
      currency: "CAD",
    };

    if (resolvedBookingId != null) {
      metaConversionPayload.booking_id = resolvedBookingId;
    }

    if (stored?.bookingValue != null) {
      metaConversionPayload.value = stored.bookingValue;
    }

    tracked.current = true;

    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", metaConversionPayload);
      window.fbq("trackCustom", "BookingSubmission", metaConversionPayload);
    }

    if (stored) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "booking_submission_success",
        bookingId: stored.bookingId,
        conversionValue: stored.bookingValue,
        conversionCurrency: "CAD",
      });
    }

    window.sessionStorage.setItem(META_TRACKED_CONVERSION_KEY, trackingKey);
    window.sessionStorage.removeItem(BOOKING_CONVERSION_STORAGE_KEY);
  }, [bookingIdFromUrl]);

  return null;
}
