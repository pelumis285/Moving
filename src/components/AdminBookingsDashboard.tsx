"use client";

import { useEffect, useMemo, useState } from "react";
import { getBuildingTypeLabel, getLongCarryLabel } from "@/lib/pricing";

type AdminBooking = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  loadSize: string;
  moveDate: string;
  distanceKm: number | null;
  fragileItems: number;
  heavyItems: number;
  stairFlights: number;
  elevatorAccess: boolean;
  packingHelp: boolean;
  assemblyHelp: boolean;
  longCarry: string;
  buildingType: string;
  carryFloor: number;
  estimatedCost: string | null;
  finalCost: string | null;
  targetBudget: string | null;
  negotiationNotes: string | null;
  notes: string | null;
  adminNotes: string | null;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
  confirmationEmailSentAt: string | null;
  lastRescheduledAt: string | null;
  rescheduleTokenExpiresAt: string | null;
  currentBillAmount: number;
  rescheduleEligible: boolean;
  rescheduleExpired: boolean;
  rescheduleEligibleAt: string;
  rescheduleUrl: string | null;
  createdAtLabel: string;
  confirmedAtLabel: string;
};

type AdminReview = {
  id: number;
  fullName: string;
  email: string;
  location: string | null;
  rating: number;
  review: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  approvedAt: string | null;
  createdAtLabel: string;
  approvedAtLabel: string;
};

type BookingDraftState = Record<
  number,
  {
    finalCost: string;
    moveDate: string;
    adminNotes: string;
  }
>;

type ReviewDraftState = Record<
  number,
  {
    adminNotes: string;
  }
>;

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const ADMIN_PASSWORD_STORAGE_KEY = "surftmove-admin-password";

function getSavedAdminPassword() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) ?? "";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function getStars(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
}

function createBookingDrafts(bookings: AdminBooking[]) {
  return bookings.reduce<BookingDraftState>((acc, booking) => {
    acc[booking.id] = {
      finalCost: booking.finalCost ?? String(booking.currentBillAmount),
      moveDate: booking.moveDate,
      adminNotes: booking.adminNotes ?? "",
    };
    return acc;
  }, {});
}

function createReviewDrafts(reviews: AdminReview[]) {
  return reviews.reduce<ReviewDraftState>((acc, review) => {
    acc[review.id] = {
      adminNotes: review.adminNotes ?? "",
    };
    return acc;
  }, {});
}

export default function AdminBookingsDashboard() {
  const [passwordInput, setPasswordInput] = useState(getSavedAdminPassword);
  const [adminPassword, setAdminPassword] = useState("");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [bookingDrafts, setBookingDrafts] = useState<BookingDraftState>({});
  const [reviewDrafts, setReviewDrafts] = useState<ReviewDraftState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);

  const hasPassword = Boolean(adminPassword);
  const bookingCountLabel = useMemo(
    () => `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`,
    [bookings.length],
  );
  const reviewCountLabel = useMemo(
    () => `${reviews.length} review${reviews.length === 1 ? "" : "s"}`,
    [reviews.length],
  );

  async function loadDashboard(password: string) {
    setLoading(true);
    setError("");

    try {
      const headers = { "x-admin-password": password };
      const [bookingsRes, reviewsRes] = await Promise.all([
        fetch("/api/admin/bookings", { headers, cache: "no-store" }),
        fetch("/api/admin/reviews", { headers, cache: "no-store" }),
      ]);
      const [bookingsData, reviewsData] = await Promise.all([bookingsRes.json(), reviewsRes.json()]);

      if (!bookingsRes.ok || !bookingsData.ok) {
        throw new Error(bookingsData.error || "Could not load bookings.");
      }

      if (!reviewsRes.ok || !reviewsData.ok) {
        throw new Error(reviewsData.error || "Could not load reviews.");
      }

      setBookings(bookingsData.bookings);
      setReviews(reviewsData.reviews);
      setBookingDrafts(createBookingDrafts(bookingsData.bookings));
      setReviewDrafts(createReviewDrafts(reviewsData.reviews));
      setAdminPassword(password);
      window.sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Could not load the admin dashboard.";
      setError(message);
      setAdminPassword("");
      window.sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = getSavedAdminPassword();
    if (!saved) return;

    const timeoutId = window.setTimeout(() => {
      void loadDashboard(saved);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateBookingDraft(id: number, field: keyof BookingDraftState[number], value: string) {
    setBookingDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  function updateReviewDraft(id: number, value: string) {
    setReviewDrafts((current) => ({
      ...current,
      [id]: {
        adminNotes: value,
      },
    }));
  }

  async function handleConfirm(bookingId: number) {
    const draft = bookingDrafts[bookingId];
    if (!draft) return;

    setActiveBookingId(bookingId);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/bookings/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          id: bookingId,
          finalCost: draft.finalCost,
          moveDate: draft.moveDate,
          adminNotes: draft.adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not confirm booking.");
      }

      setNotice(
        data.emailDelivered
          ? `Booking #${bookingId} updated and confirmation email with PDF sent.`
          : `Booking #${bookingId} updated. Email delivery is not configured yet.`,
      );
      await loadDashboard(adminPassword);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not confirm booking.");
    } finally {
      setActiveBookingId(null);
    }
  }

  async function handleDownloadPdf(bookingId: number) {
    setActiveBookingId(bookingId);
    setError("");
    setNotice("");

    try {
      const res = await fetch(`/api/admin/bookings/pdf?id=${bookingId}`, {
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not generate PDF.");
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      const contentDisposition = res.headers.get("content-disposition");
      const match = contentDisposition?.match(/filename="([^"]+)"/i);
      anchor.download = match?.[1] ?? `surftmove-booking-${String(bookingId).padStart(6, "0")}.pdf`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Could not generate PDF.");
    } finally {
      setActiveBookingId(null);
    }
  }

  async function handleModerateReview(reviewId: number, status: "approved" | "rejected" | "pending") {
    setActiveReviewId(reviewId);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/reviews/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          id: reviewId,
          status,
          adminNotes: reviewDrafts[reviewId]?.adminNotes ?? "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not update review status.");
      }

      setNotice(`Review #${reviewId} moved to ${status}.`);
      await loadDashboard(adminPassword);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Could not update review status.");
    } finally {
      setActiveReviewId(null);
    }
  }

  function handleLogout() {
    setAdminPassword("");
    setPasswordInput("");
    setBookings([]);
    setReviews([]);
    setBookingDrafts({});
    setReviewDrafts({});
    setNotice("");
    setError("");
    window.sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
  }

  if (!hasPassword) {
    return (
      <div className={`${cardClass} max-w-lg`}>
        <h2 className="text-xl font-bold text-slate-900">Admin Access</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the admin password to review bookings, moderate customer reviews, and manage move
          confirmations.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void loadDashboard(passwordInput);
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-password">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              className={inputClass}
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Open Dashboard"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">
            {bookingCountLabel} and {reviewCountLabel}. Review quote details, approve customer reviews,
            and send booking confirmations from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadDashboard(adminPassword)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Log Out
          </button>
        </div>
      </div>

      {notice ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <section className="space-y-6">
        <div className={cardClass}>
          <h3 className="text-xl font-bold text-slate-900">Live Bookings</h3>
          <p className="mt-1 text-sm text-slate-600">
            Review custom quote factors, negotiation notes, reschedule access, and the final bill before
            confirming a move.
          </p>
        </div>

        <div className="grid gap-6">
          {bookings.map((booking) => {
            const draft = bookingDrafts[booking.id];
            const actionBusy = activeBookingId === booking.id;

            return (
              <article key={booking.id} className={cardClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-xl font-bold text-slate-900">
                        #{booking.id} {booking.fullName}
                      </h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {booking.email} | {booking.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Requested {booking.createdAtLabel}. Confirmed {booking.confirmedAtLabel}.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleDownloadPdf(booking.id)}
                      disabled={actionBusy}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirm(booking.id)}
                      disabled={actionBusy}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {actionBusy ? "Working..." : booking.confirmedAt ? "Update & Resend" : "Confirm & Email"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p>
                        <strong>From:</strong> {booking.origin}
                      </p>
                      <p className="mt-2">
                        <strong>To:</strong> {booking.destination}
                      </p>
                      <p className="mt-2">
                        <strong>Move date:</strong> {formatDateOnly(booking.moveDate)}
                      </p>
                      <p className="mt-2">
                        <strong>Estimated cost:</strong>{" "}
                        {formatMoney(Number(booking.estimatedCost ?? booking.currentBillAmount))}
                      </p>
                      <p className="mt-2">
                        <strong>Current billed amount:</strong> {formatMoney(booking.currentBillAmount)}
                      </p>
                      <p className="mt-2">
                        <strong>Reschedule link:</strong>{" "}
                        {booking.rescheduleUrl ?? "Will be generated on first confirmation"}
                      </p>
                      <p className="mt-2">
                        <strong>Reschedule window:</strong>{" "}
                        {booking.rescheduleEligible
                          ? `Open now. Expires ${formatDateTime(booking.rescheduleTokenExpiresAt)}.`
                          : booking.rescheduleExpired
                            ? `Expired ${formatDateTime(booking.rescheduleTokenExpiresAt)}.`
                            : `Locked until ${formatDateTime(booking.rescheduleEligibleAt)}. Expires ${formatDateTime(booking.rescheduleTokenExpiresAt)}.`}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Custom Quote Factors
                      </h5>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <p>
                          <strong>Fragile items:</strong> {booking.fragileItems}
                        </p>
                        <p>
                          <strong>Heavy items:</strong> {booking.heavyItems}
                        </p>
                        <p>
                          <strong>Stair flights:</strong> {booking.stairFlights}
                        </p>
                        <p>
                          <strong>Access:</strong> {getLongCarryLabel(booking.longCarry)}
                        </p>
                        <p>
                          <strong>Pickup building:</strong> {getBuildingTypeLabel(booking.buildingType)}
                        </p>
                        <p>
                          <strong>Carry floor:</strong> {booking.carryFloor}
                        </p>
                        <p>
                          <strong>Elevator access:</strong> {booking.elevatorAccess ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Packing help:</strong> {booking.packingHelp ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Assembly help:</strong> {booking.assemblyHelp ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Target budget:</strong>{" "}
                          {booking.targetBudget ? formatMoney(Number(booking.targetBudget)) : "Not provided"}
                        </p>
                      </div>
                      {booking.negotiationNotes ? (
                        <p className="mt-3 whitespace-pre-wrap">
                          <strong>Negotiation notes:</strong> {booking.negotiationNotes}
                        </p>
                      ) : null}
                      {booking.notes ? (
                        <p className="mt-3 whitespace-pre-wrap">
                          <strong>Customer notes:</strong> {booking.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`finalCost-${booking.id}`}>
                        Final bill amount (CAD)
                      </label>
                      <input
                        id={`finalCost-${booking.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={draft?.finalCost ?? ""}
                        onChange={(event) => updateBookingDraft(booking.id, "finalCost", event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`moveDate-${booking.id}`}>
                        Confirmed move date
                      </label>
                      <input
                        id={`moveDate-${booking.id}`}
                        type="date"
                        className={inputClass}
                        value={draft?.moveDate ?? booking.moveDate}
                        onChange={(event) => updateBookingDraft(booking.id, "moveDate", event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`adminNotes-${booking.id}`}>
                        Admin notes
                      </label>
                      <textarea
                        id={`adminNotes-${booking.id}`}
                        rows={5}
                        className={inputClass}
                        value={draft?.adminNotes ?? ""}
                        onChange={(event) => updateBookingDraft(booking.id, "adminNotes", event.target.value)}
                        placeholder="Optional notes to include in the customer confirmation."
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                      Confirmation email sent: {formatDateTime(booking.confirmationEmailSentAt)}
                      <br />
                      Last rescheduled: {formatDateTime(booking.lastRescheduledAt)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
              No bookings have been submitted yet.
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className={cardClass}>
          <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
          <p className="mt-1 text-sm text-slate-600">
            Approve or reject reviews before they become visible on the public website.
          </p>
        </div>

        <div className="grid gap-6">
          {reviews.map((review) => {
            const actionBusy = activeReviewId === review.id;

            return (
              <article key={review.id} className={cardClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-xl font-bold text-slate-900">
                        #{review.id} {review.fullName}
                      </h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {review.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-amber-500">{getStars(review.rating)}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {review.email}
                      {review.location ? ` | ${review.location}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Submitted {review.createdAtLabel}. Approved {review.approvedAtLabel}.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleModerateReview(review.id, "approved")}
                      disabled={actionBusy}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {actionBusy ? "Working..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleModerateReview(review.id, "rejected")}
                      disabled={actionBusy}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleModerateReview(review.id, "pending")}
                      disabled={actionBusy}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Set Pending
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="whitespace-pre-wrap">{review.review}</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`reviewNotes-${review.id}`}>
                      Admin notes
                    </label>
                    <textarea
                      id={`reviewNotes-${review.id}`}
                      rows={5}
                      className={inputClass}
                      value={reviewDrafts[review.id]?.adminNotes ?? ""}
                      onChange={(event) => updateReviewDraft(review.id, event.target.value)}
                      placeholder="Optional moderation note for your internal records."
                    />
                  </div>
                </div>
              </article>
            );
          })}

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
              No reviews have been submitted yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
