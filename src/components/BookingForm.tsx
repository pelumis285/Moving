"use client";

import { useMemo, useState } from "react";
import {
  LOAD_SIZES,
  LONG_CARRY_OPTIONS,
  calculateDetailedPrice,
  formatCAD,
} from "@/lib/pricing";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const checkboxClass =
  "h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-2 focus:ring-red-100";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  origin: "",
  destination: "",
  loadSize: "1-bedroom",
  moveDate: "",
  distanceKm: "30",
  fragileItems: "0",
  heavyItems: "0",
  stairFlights: "0",
  elevatorAccess: false,
  packingHelp: false,
  assemblyHelp: false,
  longCarry: "standard",
  targetBudget: "",
  negotiationNotes: "",
  notes: "",
};

type FormState = typeof initialForm;
type TextField = Exclude<keyof FormState, "elevatorAccess" | "packingHelp" | "assemblyHelp">;

export default function BookingForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const quote = useMemo(
    () =>
      calculateDetailedPrice(form.loadSize, Number(form.distanceKm) || 0, {
        fragileItems: Number(form.fragileItems) || 0,
        heavyItems: Number(form.heavyItems) || 0,
        stairFlights: Number(form.stairFlights) || 0,
        elevatorAccess: form.elevatorAccess,
        packingHelp: form.packingHelp,
        assemblyHelp: form.assemblyHelp,
        longCarry: form.longCarry,
      }),
    [form],
  );

  function updateText(field: TextField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateToggle(field: "elevatorAccess" | "packingHelp" | "assemblyHelp", value: boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          distanceKm: Number(form.distanceKm) || 0,
          fragileItems: Number(form.fragileItems) || 0,
          heavyItems: Number(form.heavyItems) || 0,
          stairFlights: Number(form.stairFlights) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        `Thank you, ${form.fullName.split(" ")[0]}! Your booking request was received. We'll review your move details, custom quote factors, and budget notes before confirming.`,
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
        {quote ? (
          <p className="mt-4 text-sm text-slate-700">
            Your estimated quote: <strong>{formatCAD(quote.total)}</strong> (incl. HST)
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
            setForm(initialForm);
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
      <div className="grid gap-6 lg:col-span-2">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fullName">
              Full Name *
            </label>
            <input
              id="fullName"
              className={inputClass}
              value={form.fullName}
              onChange={(event) => updateText("fullName", event.target.value)}
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
              onChange={(event) => updateText("phone", event.target.value)}
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
            onChange={(event) => updateText("email", event.target.value)}
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
              onChange={(event) => updateText("origin", event.target.value)}
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
              onChange={(event) => updateText("destination", event.target.value)}
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
              onChange={(event) => updateText("loadSize", event.target.value)}
              required
            >
              {LOAD_SIZES.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
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
              onChange={(event) => updateText("distanceKm", event.target.value)}
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
              onChange={(event) => updateText("moveDate", event.target.value)}
              required
            />
          </div>
        </div>

        <section id="custom-quote" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Alternative Quote Details</h3>
            <p className="mt-1 text-sm text-slate-600">
              Add the details that usually change pricing so we can prepare a more realistic quote and
              work with your budget before confirming the move.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="fragileItems">
                Fragile item count
              </label>
              <input
                id="fragileItems"
                type="number"
                min={0}
                className={inputClass}
                value={form.fragileItems}
                onChange={(event) => updateText("fragileItems", event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="heavyItems">
                Heavy / oversized items
              </label>
              <input
                id="heavyItems"
                type="number"
                min={0}
                className={inputClass}
                value={form.heavyItems}
                onChange={(event) => updateText("heavyItems", event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="stairFlights">
                Total stair flights
              </label>
              <input
                id="stairFlights"
                type="number"
                min={0}
                className={inputClass}
                value={form.stairFlights}
                onChange={(event) => updateText("stairFlights", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="longCarry">
                Access / long carry
              </label>
              <select
                id="longCarry"
                className={inputClass}
                value={form.longCarry}
                onChange={(event) => updateText("longCarry", event.target.value)}
              >
                {LONG_CARRY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                {LONG_CARRY_OPTIONS.find((option) => option.key === form.longCarry)?.description}
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="targetBudget">
                Target budget (optional)
              </label>
              <input
                id="targetBudget"
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.targetBudget}
                onChange={(event) => updateText("targetBudget", event.target.value)}
                placeholder="Example: 1450"
              />
              <p className="mt-1 text-xs text-slate-500">
                Share the range you are hoping for and we&apos;ll review it with your move details.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={form.elevatorAccess}
                onChange={(event) => updateToggle("elevatorAccess", event.target.checked)}
              />
              <span>
                <strong className="block text-slate-900">Elevator access</strong>
                Let us know if either location has an elevator available.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={form.packingHelp}
                onChange={(event) => updateToggle("packingHelp", event.target.checked)}
              />
              <span>
                <strong className="block text-slate-900">Packing help</strong>
                Add professional packing support and supplies to the request.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={form.assemblyHelp}
                onChange={(event) => updateToggle("assemblyHelp", event.target.checked)}
              />
              <span>
                <strong className="block text-slate-900">Assembly help</strong>
                We can handle furniture disassembly and reassembly if needed.
              </span>
            </label>
          </div>

          <div className="mt-5">
            <label className={labelClass} htmlFor="negotiationNotes">
              Quote negotiation notes
            </label>
            <textarea
              id="negotiationNotes"
              rows={4}
              className={inputClass}
              value={form.negotiationNotes}
              onChange={(event) => updateText("negotiationNotes", event.target.value)}
              placeholder="Tell us what matters most: fixed budget, timing flexibility, combined services, price concerns, or anything else you want us to work through with you."
            />
          </div>
        </section>

        <div>
          <label className={labelClass} htmlFor="notes">
            Additional Move Details
          </label>
          <textarea
            id="notes"
            rows={4}
            className={inputClass}
            value={form.notes}
            onChange={(event) => updateText("notes", event.target.value)}
            placeholder="Parking instructions, building rules, elevators, fragile rooms, preferred arrival window, or anything else that helps us prepare."
          />
        </div>

        {status === "error" ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Request My Booking"}
        </button>
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Live Estimate</h3>
          {quote ? (
            <>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{formatCAD(quote.total)}</p>
              <p className="text-xs text-slate-500">Estimated total incl. 13% HST</p>

              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">{quote.loadLabel}</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.baseFee)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">
                    Labour ({quote.movers} movers × {quote.estHours}h)
                  </dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.labour)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Travel ({quote.billableKm} billable km)</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.travelCost)}</dd>
                </div>

                {quote.adjustments.map((adjustment) => (
                  <div key={adjustment.label} className="flex justify-between gap-4">
                    <dt className="text-slate-600">{adjustment.label}</dt>
                    <dd className="font-medium text-slate-900">{formatCAD(adjustment.amount)}</dd>
                  </div>
                ))}

                <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">HST (13%)</dt>
                  <dd className="font-medium text-slate-900">{formatCAD(quote.hst)}</dd>
                </div>
              </dl>

              {form.targetBudget ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                  Target budget noted: <strong>{formatCAD(Number(form.targetBudget) || 0)}</strong>. We&apos;ll
                  review it against your move details and discuss options before confirming.
                </p>
              ) : null}

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                This is a working estimate. Your special handling details and negotiation notes are reviewed
                by the admin team before the final bill is confirmed.
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
