import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { driverProfiles } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin";
import { escapeHtml, sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = {
  id?: number;
  status?: string;
  adminNotes?: string;
};

function buildDriverStatusEmail(
  fullName: string,
  status: "pending" | "approved" | "rejected",
  adminNotes: string,
) {
  if (status === "approved") {
    return `
      <h2>Your driver profile has been approved</h2>
      <p>Hi ${escapeHtml(fullName)},</p>
      <p>Your driver profile with ${escapeHtml(site.name)} has been approved by the admin team.</p>
      ${adminNotes ? `<p><strong>Admin notes:</strong><br/>${escapeHtml(adminNotes).replace(/\n/g, "<br/>")}</p>` : ""}
      <p>We now have your profile, rate, and service area saved in the system.</p>
    `;
  }

  if (status === "rejected") {
    return `
      <h2>Your driver profile was reviewed</h2>
      <p>Hi ${escapeHtml(fullName)},</p>
      <p>Your driver profile with ${escapeHtml(site.name)} was reviewed, but it was not approved at this time.</p>
      ${adminNotes ? `<p><strong>Admin notes:</strong><br/>${escapeHtml(adminNotes).replace(/\n/g, "<br/>")}</p>` : ""}
    `;
  }

  return `
    <h2>Your driver profile is pending review</h2>
    <p>Hi ${escapeHtml(fullName)},</p>
    <p>Your driver profile with ${escapeHtml(site.name)} is currently marked as pending.</p>
    ${adminNotes ? `<p><strong>Admin notes:</strong><br/>${escapeHtml(adminNotes).replace(/\n/g, "<br/>")}</p>` : ""}
  `;
}

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

  const driverId = Number(body.id);
  const status = (body.status ?? "").trim();
  const adminNotes = (body.adminNotes ?? "").trim();

  if (!Number.isInteger(driverId) || driverId <= 0) {
    return Response.json({ ok: false, error: "Driver profile id is required." }, { status: 400 });
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return Response.json({ ok: false, error: "A valid driver status is required." }, { status: 400 });
  }

  const [existing] = await getDb().select().from(driverProfiles).where(eq(driverProfiles.id, driverId)).limit(1);
  if (!existing) {
    return Response.json({ ok: false, error: "Driver profile not found." }, { status: 404 });
  }

  const now = new Date();
  const [updated] = await getDb()
    .update(driverProfiles)
    .set({
      status,
      adminNotes: adminNotes || null,
      approvedAt: status === "approved" ? existing.approvedAt ?? now : null,
    })
    .where(eq(driverProfiles.id, driverId))
    .returning();

  const emailResult = await sendEmail({
    to: updated.email,
    subject:
      status === "approved"
        ? `${site.name} driver profile approved`
        : status === "rejected"
          ? `${site.name} driver profile review update`
          : `${site.name} driver profile pending review`,
    html: buildDriverStatusEmail(updated.fullName, status as "pending" | "approved" | "rejected", adminNotes),
  });

  return Response.json({
    ok: true,
    emailDelivered: emailResult.delivered,
    driver: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      approvedAt: updated.approvedAt?.toISOString() ?? null,
    },
  });
}
