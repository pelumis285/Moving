"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LOAD_SIZES, calculatePrice, formatCAD, PER_KM_RATE } from "@/lib/pricing";
import { formatDistanceKm } from "@/lib/distance-format";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function PricingCalculator() {
  const [loadSize, setLoadSize] = useState("2-bedroom");
  const [distanceKm, setDistanceKm] = useState("50");

  const quote = useMemo(
    () => calculatePrice(loadSize, Number(distanceKm) || 0),
    [loadSize, distanceKm],
  );

  return (
    <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Instant Cost Calculator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pricing is based on your load size plus travel distance. We charge a flat {formatCAD(PER_KM_RATE)}/km
          for the full moving distance.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className={labelClass} htmlFor="calc-load">
              Load Size
            </label>
            <select
              id="calc-load"
              className={inputClass}
              value={loadSize}
              onChange={(e) => setLoadSize(e.target.value)}
            >
              {LOAD_SIZES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {LOAD_SIZES.find((l) => l.key === loadSize)?.description}
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="calc-distance">
              Estimated Distance: {formatDistanceKm(Number(distanceKm) || 0)}
            </label>
            <input
              id="calc-distance"
              type="range"
              min={0}
              max={800}
              step={5}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full accent-red-600"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Local</span>
              <span>Long distance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 p-6 text-white">
        <p className="text-sm font-medium text-slate-300">Estimated Total</p>
        <p className="mt-1 text-4xl font-extrabold">{quote ? formatCAD(quote.total) : "—"}</p>
        <p className="text-xs text-slate-400">incl. 13% Ontario HST</p>

        {quote && (
          <dl className="mt-6 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-300">Base handling fee</dt>
              <dd className="font-medium">{formatCAD(quote.baseFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-300">
                Labour ({quote.movers} movers × {quote.estHours}h @ {formatCAD(quote.hourlyRate)})
              </dt>
              <dd className="font-medium">{formatCAD(quote.labour)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-300">Travel ({formatDistanceKm(quote.billableKm)})</dt>
              <dd className="font-medium">{formatCAD(quote.travelCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2.5">
              <dt className="text-slate-300">Subtotal</dt>
              <dd className="font-medium">{formatCAD(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-300">HST (13%)</dt>
              <dd className="font-medium">{formatCAD(quote.hst)}</dd>
            </div>
          </dl>
        )}

        <Link
          href="/booking"
          className="mt-6 block rounded-lg bg-red-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Book This Move
        </Link>
      </div>
    </div>
  );
}
