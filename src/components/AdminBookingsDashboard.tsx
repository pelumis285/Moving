"use client";

import { useEffect, useMemo, useState } from "react";

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
  estimatedCost: string | null;
  finalCost: string | null;
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
  rescheduleEligibleAt: string;
  rescheduleUrl: string | null;
  createdAtLabel: string;
  confirmedAtLabel: string;
};

type DraftState = Record<
  number,
  {
    finalCost: string;
    moveDate: string;
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

function createDrafts(bookings: AdminBooking[]) {
  return bookings.reduce<DraftState>((acc, booking) => {
    acc[booking.id] = {
      finalCost: booking.finalCost ?? String(booking.currentBillAmount),
      moveDate: booking.moveDate,
      adminNotes: booking.adminNotes ?? "",
    };
    return acc;
  }, {});
}

export default function AdminBookingsDashboard() {
  const [passwordInput, setPasswordInput] = useState(getSavedAdminPassword);
  const [adminPassword, setAdminPassword] = useState("");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [drafts, setDrafts] = useState<DraftState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);

  const hasPassword = Boolean(adminPassword);
  const bookingCountLabel = useMemo(() => `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`, [bookings.length]);

  async function loadBookings(password: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/bookings", {
        headers: {
          "x-admin-password": password,
        },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not load bookings.");
      }

      setBookings(data.bookings);
      setDrafts(createDrafts(data.bookings));
      setAdminPassword(password);
      window.sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load bookings.";
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
      void loadBookings(saved);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateDraft(id: number, field: keyof DraftState[number], value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function handleConfirm(bookingId: number) {
    const draft = drafts[bookingId];
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
          ? `Booking #${bookingId} updated and confirmation email sent.`
          : `Booking #${bookingId} updated. Email delivery is not configured yet.`,
      );
      await loadBookings(adminPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm booking.");
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
      anchor.download = `booking-${bookingId}.pdf`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate PDF.");
    } finally {
      setActiveBookingId(null);
    }
  }

  function handleLogout() {
    setAdminPassword("");
    setPasswordInput("");
    setBookings([]);
    setDrafts({});
    setNotice("");
    setError("");
    window.sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
  }

  if (!hasPassword) {
    return (
      <div className={`${cardClass} max-w-lg`}>
        <h2 className="text-xl font-bold text-slate-900">Admin Access</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the admin password to view booking requests and send customer confirmations.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void loadBookings(passwordInput);
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
          <h2 className="text-xl font-bold text-slate-900">Live Bookings</h2>
          <p className="mt-1 text-sm text-slate-600">
            {bookingCountLabel}. Confirm a booking to send the customer their billing details and move date.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadBookings(adminPassword)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
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

      {notice ? <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-6">
        {bookings.map((booking) => {
          const draft = drafts[booking.id];
          const actionBusy = activeBookingId === booking.id;

          return (
            <article key={booking.id} className={cardClass}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      #{booking.id} {booking.fullName}
                    </h3>
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

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
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
                      <strong>Estimated cost:</strong> {formatMoney(Number(booking.estimatedCost ?? booking.currentBillAmount))}
                    </p>
                    <p className="mt-2">
                      <strong>Current billed amount:</strong> {formatMoney(booking.currentBillAmount)}
                    </p>
                    <p className="mt-2">
                      <strong>Reschedule link:</strong>{" "}
                      {booking.rescheduleEligible
                        ? booking.rescheduleUrl ?? "Will be generated on first confirmation"
                        : `Not yet. Unlocks ${formatDateTime(booking.rescheduleEligibleAt)}.`}
                    </p>
                    {booking.notes ? (
                      <p className="mt-2 whitespace-pre-wrap">
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
                      onChange={(event) => updateDraft(booking.id, "finalCost", event.target.value)}
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
                      onChange={(event) => updateDraft(booking.id, "moveDate", event.target.value)}
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
                      onChange={(event) => updateDraft(booking.id, "adminNotes", event.target.value)}
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
      </div>
    </div>
  );
}
