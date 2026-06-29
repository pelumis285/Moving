"use client";

import { useMemo, useState } from "react";
import { LOAD_SIZES, calculatePrice, formatCAD } from "@/lib/pricing";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function BookingForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    origin: "",
    destination: "",
    loadSize: "1-bedroom",
    moveDate: "",
    distanceKm: "30",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const quote = useMemo(
    () => calculatePrice(form.loadSize, Number(form.distanceKm) || 0),
    [form.loadSize, form.distanceKm],
  );

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, distanceKm: Number(form.distanceKm) || 0 }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage(
        `Thank you, ${form.fullName.split(" ")[0]}! Your booking request was received. We'll confirm within a few hours.`,
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-600 text-2xl text-white">
          ✓
        </div>
        <h3 className="text-xl font-bold text-slate-900">Booking Received!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{message}</p>
        {quote && (
          <p className="mt-4 text-sm text-slate-700">
            Your estimated quote: <strong>{formatCAD(quote.total)}</strong> (incl. HST)
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setForm((f) => ({ ...f, notes: "" }));
          }}
          className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Book Another Move
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-3">
      <div className="grid gap-5 lg:col-span-2">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fullName">
              Full Name *
            </label>
            <input
              id="fullName"
              className={inputClass}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone *
            </label>
            <input
              id="phone"
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
              placeholder="(416) 555-0123"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            placeholder="jane@example.com"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="origin">
              Moving From (Origin) *
            </label>
            <input
              id="origin"
              className={inputClass}
              value={form.origin}
              onChange={(e) => update("origin", e.target.value)}
              required
              placeholder="123 King St, Toronto, ON"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="destination">
              Moving To (Destination) *
            </label>
            <input
              id="destination"
              className={inputClass}
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
              required
              placeholder="456 Bank St, Ottawa, ON"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="loadSize">
              Load Size *
            </label>
            <select
              id="loadSize"
              className={inputClass}
              value={form.loadSize}
              onChange={(e) => update("loadSize", e.target.value)}
              required
            >
              {LOAD_SIZES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="distanceKm">
              Est. Distance (km) *
            </label>
            <input
              id="distanceKm"
              type="number"
              min={0}
              className={inputClass}
              value={form.distanceKm}
              onChange={(e) => update("distanceKm", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="moveDate">
              Move Date *
            </label>
            <input
              id="moveDate"
              type="date"
              min={today}
              className={inputClass}
              value={form.moveDate}
              onChange={(e) => update("moveDate", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="notes">
            Additional Details (stairs, elevator, fragile items…)
          </label>
          <textarea
            id="notes"
            rows={4}
            className={inputClass}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Tell us anything that helps us prepare for your move."
          />
        </div>

        {status === "error" && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Request My Booking"}
        </button>
      </div>

      {/* Live quote panel */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Live Estimate</h3>
          {quote ? (
            <>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{formatCAD(quote.total)}</p>
              <p className="text-xs text-slate-500">Estimated total incl. 13% HST</p>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">{quote.loadLabel}</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.baseFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    Labour ({quote.movers} movers × {quote.estHours}h)
                  </dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.labour)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Travel ({quote.billableKm} km)</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.travelCost)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <dt className="text-slate-600">HST (13%)</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.hst)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                This is a non-binding estimate. Final pricing is confirmed after a quick review of your move details.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Select a load size to see your estimate.</p>
          )}
        </div>
      </aside>
    </form>
  );
}
