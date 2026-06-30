import { desc } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { reviews } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";
import { formatDateTime } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireAdminRequest(request);
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const rows = await getDb().select().from(reviews).orderBy(desc(reviews.createdAt));

  return Response.json({
    ok: true,
    reviews: rows.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      approvedAt: review.approvedAt?.toISOString() ?? null,
      createdAtLabel: formatDateTime(review.createdAt),
      approvedAtLabel: formatDateTime(review.approvedAt),
    })),
  });
}
