import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";
import { createBookingPdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireAdminRequest(request);
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const bookingId = Number(searchParams.get("id"));

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return Response.json({ ok: false, error: "Booking id is required." }, { status: 400 });
  }

  const [booking] = await getDb().select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) {
    return Response.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  const bytes = await createBookingPdf(booking);

  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="booking-${booking.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
