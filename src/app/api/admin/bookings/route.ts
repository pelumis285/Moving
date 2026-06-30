import { desc } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import {
  RESCHEDULE_WAIT_DAYS,
  canOfferRescheduleLink,
  formatDateTime,
  getEffectiveBillAmount,
  getRescheduleUrl,
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
      const rescheduleEligibleAt = new Date(
        booking.createdAt.getTime() + RESCHEDULE_WAIT_DAYS * 24 * 60 * 60 * 1000,
      );

      return {
        ...booking,
        estimatedCost: booking.estimatedCost ?? null,
        finalCost: booking.finalCost ?? null,
        createdAt: booking.createdAt.toISOString(),
        confirmedAt: booking.confirmedAt?.toISOString() ?? null,
        confirmationEmailSentAt: booking.confirmationEmailSentAt?.toISOString() ?? null,
        rescheduleTokenExpiresAt: booking.rescheduleTokenExpiresAt?.toISOString() ?? null,
        lastRescheduledAt: booking.lastRescheduledAt?.toISOString() ?? null,
        currentBillAmount: getEffectiveBillAmount(booking),
        rescheduleEligible,
        rescheduleEligibleAt: rescheduleEligibleAt.toISOString(),
        rescheduleUrl: booking.rescheduleToken ? getRescheduleUrl(booking.rescheduleToken) : null,
        createdAtLabel: formatDateTime(booking.createdAt),
        confirmedAtLabel: formatDateTime(booking.confirmedAt),
      };
    }),
  });
}
