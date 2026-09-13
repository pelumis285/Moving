"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const checkboxClass =
  "h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-2 focus:ring-red-100";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  serviceArea: "",
  licenseClass: "",
  yearsExperience: "0",
  pricePerKm: "",
  vehicleTypes: "",
  availableForLongDistance: true,
  weekendAvailability: true,
  bio: "",
};

export default function DriverApplicationForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function updateText(field: Exclude<keyof typeof form, "availableForLongDistance" | "weekendAvailability">, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateToggle(field: "availableForLongDistance" | "weekendAvailability", value: boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearsExperience: Number(form.yearsExperience) || 0,
          pricePerKm: Number(form.pricePerKm) || 0,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "We could not submit your driver profile right now.");
        return;
      }

      setStatus("success");
      setMessage(
        "Your driver account profile has been submitted. We’ll review your rate, experience, and service area before approval.",
      );
      setForm(initialForm);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="driver-full-name">
          Full Name *
        </label>
        <input
          id="driver-full-name"
          className={inputClass}
          value={form.fullName}
          onChange={(event) => updateText("fullName", event.target.value)}
          required
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-phone">
          Phone *
        </label>
        <input
          id="driver-phone"
          type="tel"
          className={inputClass}
          value={form.phone}
          onChange={(event) => updateText("phone", event.target.value)}
          required
          placeholder="(705) 905-8353"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-email">
          Email *
        </label>
        <input
          id="driver-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(event) => updateText("email", event.target.value)}
          required
          placeholder="driver@example.com"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-city">
          Home City *
        </label>
        <input
          id="driver-city"
          className={inputClass}
          value={form.city}
          onChange={(event) => updateText("city", event.target.value)}
          required
          placeholder="Barrie"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-service-area">
          Service Area *
        </label>
        <input
          id="driver-service-area"
          className={inputClass}
          value={form.serviceArea}
          onChange={(event) => updateText("serviceArea", event.target.value)}
          required
          placeholder="Barrie, Toronto, Ottawa, long-distance Ontario routes"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-license-class">
          License Class *
        </label>
        <input
          id="driver-license-class"
          className={inputClass}
          value={form.licenseClass}
          onChange={(event) => updateText("licenseClass", event.target.value)}
          required
          placeholder="G, G2, DZ, AZ"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-years-experience">
          Years of Driving Experience *
        </label>
        <input
          id="driver-years-experience"
          type="number"
          min={0}
          className={inputClass}
          value={form.yearsExperience}
          onChange={(event) => updateText("yearsExperience", event.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="driver-price-per-km">
          Your Price Per Kilometre (CAD) *
        </label>
        <input
          id="driver-price-per-km"
          type="number"
          min={0}
          step="0.01"
          className={inputClass}
          value={form.pricePerKm}
          onChange={(event) => updateText("pricePerKm", event.target.value)}
          required
          placeholder="1.75"
        />
      </div>

      <div className="lg:col-span-2">
        <label className={labelClass} htmlFor="driver-vehicle-types">
          Vehicle Types You Can Drive *
        </label>
        <textarea
          id="driver-vehicle-types"
          rows={4}
          className={inputClass}
          value={form.vehicleTypes}
          onChange={(event) => updateText("vehicleTypes", event.target.value)}
          required
          placeholder="Tell us what you can drive: moving trucks, cargo vans, pickups, cars, trailers, or anything else."
        />
      </div>

      <div className="lg:col-span-2">
        <label className={labelClass} htmlFor="driver-bio">
          Driver Profile / Experience Summary *
        </label>
        <textarea
          id="driver-bio"
          rows={5}
          className={inputClass}
          value={form.bio}
          onChange={(event) => updateText("bio", event.target.value)}
          required
          placeholder="Share your experience, routes you are comfortable with, professionalism, customer service background, and anything that helps us understand your profile."
        />
      </div>

      <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={form.availableForLongDistance}
            onChange={(event) => updateToggle("availableForLongDistance", event.target.checked)}
          />
          <span>
            <strong className="block text-slate-900">Available for long-distance routes</strong>
            Let us know if you can handle longer trips beyond your local city.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={form.weekendAvailability}
            onChange={(event) => updateToggle("weekendAvailability", event.target.checked)}
          />
          <span>
            <strong className="block text-slate-900">Available on weekends</strong>
            Weekend availability helps us match you with more moving requests.
          </span>
        </label>
      </div>

      {status === "success" ? (
        <p className="lg:col-span-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="lg:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      ) : null}

      <div className="lg:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Create Driver Profile"}
        </button>
      </div>
    </form>
  );
}
