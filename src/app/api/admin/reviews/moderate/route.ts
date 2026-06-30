import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { reviews } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Body = {
  id?: number;
  status?: string;
  adminNotes?: string;
};

export async function POST(request: Request) {
  const authError = requireAdminRequest(request);
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const reviewId = Number(body.id);
  const status = (body.status ?? "").trim();
  const adminNotes = (body.adminNotes ?? "").trim();

  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    return Response.json({ ok: false, error: "Review id is required." }, { status: 400 });
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return Response.json({ ok: false, error: "A valid moderation status is required." }, { status: 400 });
  }

  const [existing] = await getDb().select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!existing) {
    return Response.json({ ok: false, error: "Review not found." }, { status: 404 });
  }

  const now = new Date();
  const [updated] = await getDb()
    .update(reviews)
    .set({
      status,
      adminNotes: adminNotes || null,
      approvedAt: status === "approved" ? existing.approvedAt ?? now : null,
    })
    .where(eq(reviews.id, reviewId))
    .returning();

  return Response.json({
    ok: true,
    review: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      approvedAt: updated.approvedAt?.toISOString() ?? null,
    },
  });
}
