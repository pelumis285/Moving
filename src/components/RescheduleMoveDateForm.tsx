"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type RescheduleBooking = {
  id: number;
  fullName: string;
  origin: string;
  destination: string;
  moveDate: string;
  status: string;
  finalBillAmount: number;
  tokenExpiresAt: string | null;
  rescheduleUnlockAt: string;
  createdAt: string;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RescheduleMoveDateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [booking, setBooking] = useState<RescheduleBooking | null>(null);
  const [moveDate, setMoveDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadBooking() {
      if (!token) {
        setError("This reschedule link is missing its token.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookings/reschedule?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Could not load your booking.");
        }

        setBooking(data.booking);
        setMoveDate(data.booking.moveDate);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your booking.");
      } finally {
        setLoading(false);
      }
    }

    void loadBooking();
  }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          moveDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not update the moving date.");
      }

      setNotice(
        data.emailDelivered
          ? "Your new move date was saved and a confirmation email was sent."
          : "Your new move date was saved. Email delivery is not configured yet.",
      );
      setBooking((current) => (current ? { ...current, moveDate: data.moveDate, status: "rescheduled" } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the moving date.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading your booking...</p>;
  }

  if (!booking) {
    return <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
        <p>
          <strong>Booking reference:</strong> #{booking.id}
        </p>
        <p className="mt-2">
          <strong>Name:</strong> {booking.fullName}
        </p>
        <p className="mt-2">
          <strong>Current move date:</strong> {formatDateOnly(booking.moveDate)}
        </p>
        <p className="mt-2">
          <strong>Route:</strong> {booking.origin} to {booking.destination}
        </p>
        <p className="mt-2">
          <strong>Current bill:</strong> {formatMoney(booking.finalBillAmount)}
        </p>
        <p className="mt-2">
          <strong>Reschedule window opened:</strong> {formatDateTime(booking.rescheduleUnlockAt)}
        </p>
        <p className="mt-2">
          <strong>Reschedule link expires:</strong>{" "}
          {booking.tokenExpiresAt ? formatDateTime(booking.tokenExpiresAt) : "Not available"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="newMoveDate">
            Choose a new move date
          </label>
          <input
            id="newMoveDate"
            type="date"
            className={inputClass}
            value={moveDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(event) => setMoveDate(event.target.value)}
            required
          />
        </div>

        {notice ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update Moving Date"}
        </button>
      </form>
    </div>
  );
}
