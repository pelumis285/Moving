"use client";

import { useEffect, useState } from "react";

type PublicReview = {
  id: number;
  fullName: string;
  location: string | null;
  rating: number;
  review: string;
  approvedAt: string | null;
  createdAt: string;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

const initialForm = {
  fullName: "",
  email: "",
  location: "",
  rating: "5",
  review: "",
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date(value));
}

function getStars(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const approvedCount = reviews.length;
  const averageRating =
    approvedCount > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / approvedCount).toFixed(1) : null;
  const visibleReviews = reviews.slice(0, 3);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch("/api/reviews", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Could not load reviews.");
        }
        setReviews(data.reviews);
      } catch (reviewError) {
        setError(reviewError instanceof Error ? reviewError.message : "Could not load reviews.");
      } finally {
        setLoading(false);
      }
    }

    void loadReviews();
  }, []);

  function update(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not submit your review.");
      }

      setNotice(data.message || "Thanks for your review.");
      setForm(initialForm);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Testimonials</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">What recent customers are saying</h2>
          <p className="mt-3 text-slate-600">
            Real customer feedback only. Every public review is approved before it appears on the site.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900">{averageRating ?? "New"}</p>
            <p className="mt-1 text-sm text-slate-600">{averageRating ? "Average rating" : "Testimonials"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900">{approvedCount}</p>
            <p className="mt-1 text-sm text-slate-600">Approved review{approvedCount === 1 ? "" : "s"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900">100%</p>
            <p className="mt-1 text-sm text-slate-600">Admin-screened before publishing</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {loading ? (
              <p className="text-sm text-slate-500">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              visibleReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold tracking-wide text-amber-500">{getStars(review.rating)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.review}</p>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="font-semibold text-slate-900">{review.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {[review.location, formatDate(review.approvedAt || review.createdAt)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                No public testimonials are live yet. As soon as approved customer reviews come in, they
                will appear here automatically.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-2xl font-bold text-slate-900">Leave a Review</h3>
            <p className="mt-2 text-sm text-slate-600">
              If we helped with your move, we&apos;d love to hear about it. Your review stays private until
              admin approves it.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className={labelClass} htmlFor="review-name">
                  Full Name
                </label>
                <input
                  id="review-name"
                  className={inputClass}
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="review-email">
                  Email
                </label>
                <input
                  id="review-email"
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="review-location">
                    City / Route
                  </label>
                  <input
                    id="review-location"
                    className={inputClass}
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="Toronto to Ottawa"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="review-rating">
                    Rating
                  </label>
                  <select
                    id="review-rating"
                    className={inputClass}
                    value={form.rating}
                    onChange={(event) => update("rating", event.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} / 5
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="review-message">
                  Your Review
                </label>
                <textarea
                  id="review-message"
                  rows={5}
                  className={inputClass}
                  value={form.review}
                  onChange={(event) => update("review", event.target.value)}
                  required
                  placeholder="Tell future customers what stood out about your move."
                />
              </div>

              {notice ? (
                <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
