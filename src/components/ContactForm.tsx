"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thanks for reaching out! We'll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="c-name">
            Name *
          </label>
          <input
            id="c-name"
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="c-phone">
            Phone
          </label>
          <input
            id="c-phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(416) 555-0123"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="c-email">
          Email *
        </label>
        <input
          id="c-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="c-subject">
          Subject
        </label>
        <input
          id="c-subject"
          className={inputClass}
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="How can we help?"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="c-message">
          Message *
        </label>
        <textarea
          id="c-message"
          rows={5}
          className={inputClass}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          required
          placeholder="Tell us about your move or question…"
        />
      </div>

      {status === "success" && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
      )}
      {status === "error" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
