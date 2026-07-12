import { desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import {
  canOfferRescheduleLink,
  formatDateTime,
  getEffectiveBillAmount,
  getRescheduleTokenExpiry,
  getRescheduleUnlockAt,
  getRescheduleUrl,
  isRescheduleWindowExpired,
} from "@/lib/bookings";
import { requireAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireAdminRequest(request);
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const rows = await getDb().select().from(bookings).orderBy(desc(bookings.createdAt));

  return Response.json({
    ok: true,
    bookings: rows.map((booking) => {
      const rescheduleEligible = canOfferRescheduleLink(booking.createdAt);
      const rescheduleEligibleAt = getRescheduleUnlockAt(booking.createdAt);
      const rescheduleTokenExpiresAt = getRescheduleTokenExpiry(booking.createdAt);
      const rescheduleExpired = isRescheduleWindowExpired(booking.createdAt);

      return {
        ...booking,
        estimatedCost: booking.estimatedCost ?? null,
        finalCost: booking.finalCost ?? null,
        createdAt: booking.createdAt.toISOString(),
        confirmedAt: booking.confirmedAt?.toISOString() ?? null,
        confirmationEmailSentAt: booking.confirmationEmailSentAt?.toISOString() ?? null,
        rescheduleTokenExpiresAt: rescheduleTokenExpiresAt.toISOString(),
        lastRescheduledAt: booking.lastRescheduledAt?.toISOString() ?? null,
        currentBillAmount: getEffectiveBillAmount(booking),
        rescheduleEligible,
        rescheduleExpired,
        rescheduleEligibleAt: rescheduleEligibleAt.toISOString(),
        rescheduleUrl: booking.rescheduleToken ? getRescheduleUrl(booking.rescheduleToken) : null,
        createdAtLabel: formatDateTime(booking.createdAt),
        confirmedAtLabel: formatDateTime(booking.confirmedAt),
      };
    }),
  });
}

export async function DELETE(request: Request) {
  const authError = requireAdminRequest(request);
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const bookingId = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return Response.json({ ok: false, error: "A valid booking id is required." }, { status: 400 });
  }

  const deleted = await getDb()
    .delete(bookings)
    .where(eq(bookings.id, bookingId))
    .returning({ id: bookings.id });

  if (deleted.length === 0) {
    return Response.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  return Response.json({ ok: true, id: deleted[0]?.id ?? bookingId });
}
