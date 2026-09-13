import { desc } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { driverProfiles } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";
import { formatDateTime } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireAdminRequest(request);
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const rows = await getDb().select().from(driverProfiles).orderBy(desc(driverProfiles.createdAt));

  return Response.json({
    ok: true,
    drivers: rows.map((driver) => ({
      ...driver,
      pricePerKm: driver.pricePerKm ?? null,
      createdAt: driver.createdAt.toISOString(),
      approvedAt: driver.approvedAt?.toISOString() ?? null,
      createdAtLabel: formatDateTime(driver.createdAt),
      approvedAtLabel: formatDateTime(driver.approvedAt),
    })),
  });
}
