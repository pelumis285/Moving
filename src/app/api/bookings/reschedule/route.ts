import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import {
  buildMoveDateConflictMessage,
  buildCustomerRescheduleEmail,
  buildOwnerRescheduleNoticeEmail,
  canOfferRescheduleLink,
  findBookingDateConflictInDatabase,
  formatMoveDate,
  getEffectiveBillAmount,
  lockMoveDate,
  normalizeMoveDate,
} from "@/lib/bookings";
import { sendEmail, sendOwnerEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function getTokenFromUrl(request: Request) {
  return new URL(request.url).searchParams.get("token")?.trim() ?? "";
}

async function getBookingForToken(token: string) {
  if (!token) return null;

  const [booking] = await getDb().select().from(bookings).where(eq(bookings.rescheduleToken, token)).limit(1);
  if (!booking) return null;

  if (!booking.rescheduleTokenExpiresAt || booking.rescheduleTokenExpiresAt.getTime() < Date.now()) {
    return null;
  }

  if (!canOfferRescheduleLink(booking.createdAt)) {
    return null;
  }

  return booking;
}

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const token = getTokenFromUrl(request);
  const booking = await getBookingForToken(token);

  if (!booking) {
    return Response.json({ ok: false, error: "This reschedule link is invalid or expired." }, { status: 404 });
  }

  return Response.json({
    ok: true,
    booking: {
      id: booking.id,
      fullName: booking.fullName,
      origin: booking.origin,
      destination: booking.destination,
      moveDate: booking.moveDate,
      status: booking.status,
      finalBillAmount: getEffectiveBillAmount(booking),
      tokenExpiresAt: booking.rescheduleTokenExpiresAt?.toISOString() ?? null,
      createdAt: booking.createdAt.toISOString(),
    },
  });
}

type Body = {
  token?: string;
  moveDate?: string;
};

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const moveDate = normalizeMoveDate(body.moveDate ?? "");
  if (!token || !moveDate) {
    return Response.json({ ok: false, error: "A valid reschedule token and move date are required." }, { status: 400 });
  }

  const booking = await getBookingForToken(token);
  if (!booking) {
    return Response.json({ ok: false, error: "This reschedule link is invalid or expired." }, { status: 404 });
  }

  const previousMoveDate = booking.moveDate;
  let updated;
  try {
    const result = await getDb().transaction(async (tx) => {
      await lockMoveDate(tx, moveDate);

      const conflictingBooking = await findBookingDateConflictInDatabase(tx, moveDate, {
        excludeBookingId: booking.id,
      });
      if (conflictingBooking) {
        return { conflict: true as const };
      }

      const [rescheduledBooking] = await tx
        .update(bookings)
        .set({
          moveDate,
          status: "rescheduled",
          lastRescheduledAt: new Date(),
        })
        .where(eq(bookings.id, booking.id))
        .returning();

      return { conflict: false as const, updated: rescheduledBooking };
    });

    if (result.conflict) {
      return Response.json(
        { ok: false, error: buildMoveDateConflictMessage(moveDate) },
        { status: 409 },
      );
    }

    updated = result.updated;
  } catch (error) {
    console.error("[bookings/reschedule] db update failed:", error);
    return Response.json({ ok: false, error: "Could not update the moving date." }, { status: 500 });
  }

  const customerEmail = await sendEmail({
    to: updated.email,
    subject: `Your ${site.name} move date was updated to ${formatMoveDate(updated.moveDate)}`,
    html: buildCustomerRescheduleEmail(updated),
    replyTo: process.env.NOTIFY_EMAIL || site.operationsEmail,
  });

  const ownerEmail = await sendOwnerEmail({
    subject: `Booking #${updated.id} changed move date`,
    html: buildOwnerRescheduleNoticeEmail(updated, previousMoveDate),
    replyTo: updated.email,
  });

  return Response.json({
    ok: true,
    moveDate: updated.moveDate,
    emailDelivered: customerEmail.delivered,
    ownerEmailDelivered: ownerEmail.delivered,
  });
}
