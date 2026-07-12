import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";
import {
  buildMoveDateConflictMessage,
  buildBookingConfirmationEmail,
  buildBookingConfirmationSms,
  canOfferRescheduleLink,
  createRescheduleToken,
  findBookingDateConflictInDatabase,
  formatMoveDate,
  getRescheduleUnlockAt,
  getRescheduleTokenExpiry,
  getRescheduleUrl,
  isRescheduleWindowExpired,
  lockMoveDate,
  normalizeMoveDate,
  parseMoney,
} from "@/lib/bookings";
import { sendEmail } from "@/lib/email";
import { isDateBeforeTodayInSiteTimeZone } from "@/lib/move-date";
import { createBookingPdf, getBookingPdfFilename } from "@/lib/pdf";
import { site } from "@/lib/site";
import { sendSms } from "@/lib/sms";

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
  if (isDateBeforeTodayInSiteTimeZone(moveDate)) {
    return Response.json({ ok: false, error: "Confirmed move date cannot be in the past." }, { status: 400 });
  }

  if (finalCost == null || finalCost < 0) {
    return Response.json({ ok: false, error: "A valid final bill amount is required." }, { status: 400 });
  }

  const [existing] = await getDb().select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!existing) {
    return Response.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  const now = new Date();
  const rescheduleToken = existing.rescheduleToken ?? createRescheduleToken();
  const rescheduleUnlockAt = getRescheduleUnlockAt(existing.createdAt);
  const rescheduleTokenExpiresAt = getRescheduleTokenExpiry(existing.createdAt);
  const rescheduleWindowOpen = canOfferRescheduleLink(existing.createdAt, now);
  const rescheduleWindowExpired = isRescheduleWindowExpired(existing.createdAt, now);

  let updated;
  try {
    const result = await getDb().transaction(async (tx) => {
      await lockMoveDate(tx, moveDate);

      const conflictingBooking = await findBookingDateConflictInDatabase(tx, moveDate, {
        excludeBookingId: bookingId,
      });
      if (conflictingBooking) {
        return { conflict: true as const };
      }

      const [confirmedBooking] = await tx
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

      return { conflict: false as const, updated: confirmedBooking };
    });

    if (result.conflict) {
      return Response.json(
        { ok: false, error: buildMoveDateConflictMessage(moveDate) },
        { status: 409 },
      );
    }

    updated = result.updated;
  } catch (error) {
    console.error("[admin/bookings/confirm] db update failed:", error);
    return Response.json({ ok: false, error: "Could not confirm booking." }, { status: 500 });
  }

  const bookingPdfBytes = await createBookingPdf(updated);
  const bookingPdfAttachment = {
    filename: getBookingPdfFilename(updated.id),
    content: Buffer.from(bookingPdfBytes).toString("base64"),
  };

  const rescheduleUrl = getRescheduleUrl(rescheduleToken);

  const [emailResult, smsResult] = await Promise.all([
    sendEmail({
      to: updated.email,
      subject: `Your ${site.name} move is confirmed for ${formatMoveDate(updated.moveDate)}`,
      html: buildBookingConfirmationEmail(updated, {
        rescheduleUrl,
        rescheduleUnlockAt,
        rescheduleExpiresAt: rescheduleTokenExpiresAt,
        rescheduleWindowOpen,
        rescheduleWindowExpired,
      }),
      replyTo: process.env.NOTIFY_EMAIL || site.operationsEmail,
      attachments: [bookingPdfAttachment],
    }),
    sendSms({
      to: updated.phone,
      body: buildBookingConfirmationSms(updated, {
        rescheduleUrl,
        rescheduleUnlockAt,
        rescheduleExpiresAt: rescheduleTokenExpiresAt,
      }),
    }),
  ]);

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
    emailReason: emailResult.reason,
    smsDelivered: smsResult.delivered,
    smsReason: smsResult.reason,
    rescheduleLinkIncluded: true,
  });
}
