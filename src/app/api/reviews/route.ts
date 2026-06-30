import { desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { reviews } from "@/db/schema";
import { escapeHtml, sendOwnerEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = {
  fullName?: string;
  email?: string;
  location?: string;
  rating?: number | string;
  review?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: true, reviews: [] });
  }

  const rows = await getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.approvedAt), desc(reviews.createdAt));

  return Response.json({
    ok: true,
    reviews: rows.map((review) => ({
      id: review.id,
      fullName: review.fullName,
      location: review.location,
      rating: review.rating,
      review: review.review,
      approvedAt: review.approvedAt?.toISOString() ?? null,
      createdAt: review.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Review service is not configured yet." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim();
  const location = (body.location ?? "").trim();
  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));
  const review = (body.review ?? "").trim();

  const errors: string[] = [];
  if (fullName.length < 2) errors.push("Full name is required.");
  if (!isEmail(email)) errors.push("A valid email is required.");
  if (rating < 1 || rating > 5) errors.push("A rating between 1 and 5 is required.");
  if (review.length < 20) errors.push("Please share at least a short review so we can understand your experience.");

  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors.join(" ") }, { status: 400 });
  }

  let inserted;
  try {
    [inserted] = await getDb()
      .insert(reviews)
      .values({
        fullName,
        email,
        location: location || null,
        rating,
        review,
        status: "pending",
      })
      .returning({ id: reviews.id });
  } catch (error) {
    console.error("[reviews] db insert failed:", error);
    return Response.json({ ok: false, error: "Could not save your review. Please try again." }, { status: 500 });
  }

  const html = `
    <h2>New Review Awaiting Approval #${inserted?.id ?? ""}</h2>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Location:</strong> ${escapeHtml(location || "Not provided")}</p>
    <p><strong>Rating:</strong> ${rating}/5</p>
    <p><strong>Review:</strong> ${escapeHtml(review).replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p>This review was submitted on ${site.name} and is waiting for admin approval.</p>
  `;

  await sendOwnerEmail({
    subject: `New Review Awaiting Approval from ${fullName}`,
    html,
    replyTo: email,
  });

  return Response.json({
    ok: true,
    message: "Thanks for sharing your experience. Your review will appear after admin approval.",
  });
}
