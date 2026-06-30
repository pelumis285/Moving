import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";
import {
  buildBookingConfirmationEmail,
  canOfferRescheduleLink,
  createRescheduleToken,
  formatMoveDate,
  getRescheduleTokenExpiry,
  getRescheduleUrl,
  normalizeMoveDate,
  parseMoney,
} from "@/lib/bookings";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = {
  id?: number;
  finalCost?: number | string;
  moveDate?: string;
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

  const bookingId = Number(body.id);
  const moveDate = normalizeMoveDate(body.moveDate ?? "");
  const finalCost = parseMoney(body.finalCost);
  const adminNotes = (body.adminNotes ?? "").trim();

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return Response.json({ ok: false, error: "Booking id is required." }, { status: 400 });
  }

  if (!moveDate) {
    return Response.json({ ok: false, error: "A valid move date is required." }, { status: 400 });
  }

  if (finalCost == null || finalCost < 0) {
    return Response.json({ ok: false, error: "A valid final bill amount is required." }, { status: 400 });
  }

  const [existing] = await getDb().select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!existing) {
    return Response.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  const now = new Date();
  const needsFreshToken =
    !existing.rescheduleToken ||
    !existing.rescheduleTokenExpiresAt ||
    existing.rescheduleTokenExpiresAt.getTime() < now.getTime();
  const rescheduleToken = needsFreshToken ? createRescheduleToken() : existing.rescheduleToken!;
  const rescheduleTokenExpiresAt = getRescheduleTokenExpiry(now);
  const includeRescheduleLink = canOfferRescheduleLink(existing.createdAt, now);

  const [updated] = await getDb()
    .update(bookings)
    .set({
      moveDate,
      finalCost: finalCost.toFixed(2),
      adminNotes: adminNotes || null,
      status: existing.status === "rescheduled" ? "rescheduled" : "confirmed",
      confirmedAt: existing.confirmedAt ?? now,
      confirmationEmailSentAt: now,
      rescheduleToken,
      rescheduleTokenExpiresAt,
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  const emailResult = await sendEmail({
    to: updated.email,
    subject: `Your ${site.name} move is confirmed for ${formatMoveDate(updated.moveDate)}`,
    html: buildBookingConfirmationEmail(updated, {
      rescheduleUrl: includeRescheduleLink ? getRescheduleUrl(rescheduleToken) : null,
    }),
    replyTo: process.env.NOTIFY_EMAIL || site.operationsEmail,
  });

  return Response.json({
    ok: true,
    booking: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      confirmedAt: updated.confirmedAt?.toISOString() ?? null,
      confirmationEmailSentAt: updated.confirmationEmailSentAt?.toISOString() ?? null,
      rescheduleTokenExpiresAt: updated.rescheduleTokenExpiresAt?.toISOString() ?? null,
      lastRescheduledAt: updated.lastRescheduledAt?.toISOString() ?? null,
    },
    emailDelivered: emailResult.delivered,
    rescheduleLinkIncluded: includeRescheduleLink,
  });
}
