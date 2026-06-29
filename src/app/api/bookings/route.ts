import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import { calculatePrice, formatCAD } from "@/lib/pricing";
import { sendOwnerEmail, escapeHtml } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = {
  fullName?: string;
  email?: string;
  phone?: string;
  origin?: string;
  destination?: string;
  loadSize?: string;
  moveDate?: string;
  distanceKm?: number;
  notes?: string;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const origin = (body.origin ?? "").trim();
  const destination = (body.destination ?? "").trim();
  const loadSize = (body.loadSize ?? "").trim();
  const moveDate = (body.moveDate ?? "").trim();
  const notes = (body.notes ?? "").trim();
  const distanceKm = Math.max(0, Math.round(Number(body.distanceKm) || 0));

  const errors: string[] = [];
  if (fullName.length < 2) errors.push("Full name is required.");
  if (!isEmail(email)) errors.push("A valid email is required.");
  if (phone.length < 7) errors.push("A valid phone number is required.");
  if (!origin) errors.push("Origin address is required.");
  if (!destination) errors.push("Destination address is required.");
  if (!loadSize) errors.push("Load size is required.");
  if (!moveDate) errors.push("Move date is required.");

  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors.join(" ") }, { status: 400 });
  }

  const quote = calculatePrice(loadSize, distanceKm);
  const estimatedCost = quote ? quote.total : 0;

  if (!isDatabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Booking service is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let inserted;
  try {
    [inserted] = await getDb()
      .insert(bookings)
      .values({
        fullName,
        email,
        phone,
        origin,
        destination,
        loadSize,
        moveDate,
        distanceKm,
        estimatedCost: String(estimatedCost),
        notes: notes || null,
      })
      .returning({ id: bookings.id });
  } catch (err) {
    console.error("[bookings] db insert failed:", err);
    return Response.json({ ok: false, error: "Could not save your booking. Please try again." }, { status: 500 });
  }

  const html = `
    <h2>New Move Booking Request #${inserted?.id ?? ""}</h2>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Origin:</strong> ${escapeHtml(origin)}</p>
    <p><strong>Destination:</strong> ${escapeHtml(destination)}</p>
    <p><strong>Load size:</strong> ${escapeHtml(quote?.loadLabel ?? loadSize)}</p>
    <p><strong>Move date:</strong> ${escapeHtml(moveDate)}</p>
    <p><strong>Distance:</strong> ${distanceKm} km</p>
    <p><strong>Estimated total:</strong> ${formatCAD(estimatedCost)} (incl. HST)</p>
    ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ""}
    <hr/>
    <p>Sent from ${site.name} booking form.</p>
  `;

  const emailResult = await sendOwnerEmail({
    subject: `New Booking Request from ${fullName}`,
    html,
    replyTo: email,
  });

  return Response.json({
    ok: true,
    id: inserted?.id,
    estimatedCost,
    emailDelivered: emailResult.delivered,
  });
}
