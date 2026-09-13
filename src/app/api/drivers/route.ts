import { getDb, isDatabaseConfigured } from "@/db";
import { driverProfiles } from "@/db/schema";
import { escapeHtml, sendOwnerEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  serviceArea?: string;
  licenseClass?: string;
  yearsExperience?: number | string;
  pricePerKm?: number | string;
  vehicleTypes?: string;
  availableForLongDistance?: boolean;
  weekendAvailability?: boolean;
  bio?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Driver application service is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const city = (body.city ?? "").trim();
  const serviceArea = (body.serviceArea ?? "").trim();
  const licenseClass = (body.licenseClass ?? "").trim();
  const yearsExperience = Math.max(0, Math.round(Number(body.yearsExperience) || 0));
  const pricePerKm = Math.round(Math.max(0, Number(body.pricePerKm) || 0) * 100) / 100;
  const vehicleTypes = (body.vehicleTypes ?? "").trim();
  const bio = (body.bio ?? "").trim();
  const availableForLongDistance = Boolean(body.availableForLongDistance);
  const weekendAvailability = Boolean(body.weekendAvailability);

  const errors: string[] = [];
  if (fullName.length < 2) errors.push("Full name is required.");
  if (!isEmail(email)) errors.push("A valid email is required.");
  if (phone.length < 7) errors.push("A valid phone number is required.");
  if (city.length < 2) errors.push("Home city is required.");
  if (serviceArea.length < 3) errors.push("Service area is required.");
  if (licenseClass.length < 1) errors.push("License class is required.");
  if (pricePerKm <= 0) errors.push("Please enter a valid price per kilometre.");
  if (vehicleTypes.length < 5) errors.push("Please tell us what vehicle types you can drive.");
  if (bio.length < 30) errors.push("Please share a short driver profile so we can review your experience.");

  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors.join(" ") }, { status: 400 });
  }

  let inserted;
  try {
    [inserted] = await getDb()
      .insert(driverProfiles)
      .values({
        fullName,
        email,
        phone,
        city,
        serviceArea,
        licenseClass,
        yearsExperience,
        pricePerKm: String(pricePerKm),
        vehicleTypes,
        availableForLongDistance,
        weekendAvailability,
        bio,
        status: "pending",
      })
      .returning({ id: driverProfiles.id });
  } catch (error) {
    console.error("[drivers] db insert failed:", error);
    return Response.json({ ok: false, error: "Could not save your driver profile. Please try again." }, { status: 500 });
  }

  const html = `
    <h2>New Driver Profile Awaiting Approval #${inserted?.id ?? ""}</h2>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Home city:</strong> ${escapeHtml(city)}</p>
    <p><strong>Service area:</strong> ${escapeHtml(serviceArea)}</p>
    <p><strong>License class:</strong> ${escapeHtml(licenseClass)}</p>
    <p><strong>Years of experience:</strong> ${yearsExperience}</p>
    <p><strong>Price per kilometre:</strong> $${pricePerKm.toFixed(2)}/km</p>
    <p><strong>Vehicle types:</strong> ${escapeHtml(vehicleTypes).replace(/\n/g, "<br/>")}</p>
    <p><strong>Long-distance availability:</strong> ${availableForLongDistance ? "Yes" : "No"}</p>
    <p><strong>Weekend availability:</strong> ${weekendAvailability ? "Yes" : "No"}</p>
    <p><strong>Profile summary:</strong></p>
    <p>${escapeHtml(bio).replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p>This driver profile was submitted on ${site.name} and is waiting for admin approval.</p>
  `;

  const emailResult = await sendOwnerEmail({
    subject: `New Driver Profile Awaiting Approval from ${fullName}`,
    html,
    replyTo: email,
  });

  return Response.json({
    ok: true,
    id: inserted?.id,
    emailDelivered: emailResult.delivered,
    message: "Your driver profile has been submitted for admin review.",
  });
}
