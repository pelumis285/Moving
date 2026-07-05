import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import {
  buildMoveDateConflictMessage,
  findBookingDateConflict,
  getQuoteDetailsList,
  isMoveDateConflictError,
  normalizeMoveDate,
  parseMoney,
} from "@/lib/bookings";
import { sendOwnerEmail, escapeHtml } from "@/lib/email";
import {
  calculateDetailedPrice,
  formatCAD,
  normalizeBuildingType,
  normalizeLongCarry,
} from "@/lib/pricing";
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
  fragileItems?: number;
  heavyItems?: number;
  stairFlights?: number;
  elevatorAccess?: boolean;
  packingHelp?: boolean;
  assemblyHelp?: boolean;
  longCarry?: string;
  buildingType?: string;
  carryFloor?: number;
  targetBudget?: number | string;
  negotiationNotes?: string;
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
  const requestedMoveDate = (body.moveDate ?? "").trim();
  const normalizedMoveDate = normalizeMoveDate(requestedMoveDate);
  const notes = (body.notes ?? "").trim();
  const distanceKm = Math.max(0, Math.round(Number(body.distanceKm) || 0));
  const fragileItems = Math.max(0, Math.round(Number(body.fragileItems) || 0));
  const heavyItems = Math.max(0, Math.round(Number(body.heavyItems) || 0));
  const stairFlights = Math.max(0, Math.round(Number(body.stairFlights) || 0));
  const elevatorAccess = Boolean(body.elevatorAccess);
  const packingHelp = Boolean(body.packingHelp);
  const assemblyHelp = Boolean(body.assemblyHelp);
  const longCarry = normalizeLongCarry(body.longCarry ?? "");
  const buildingType = normalizeBuildingType(body.buildingType ?? "");
  const carryFloor = Math.max(0, Math.round(Number(body.carryFloor) || 0));
  const targetBudget = parseMoney(body.targetBudget);
  const negotiationNotes = (body.negotiationNotes ?? "").trim();

  const errors: string[] = [];
  if (fullName.length < 2) errors.push("Full name is required.");
  if (!isEmail(email)) errors.push("A valid email is required.");
  if (phone.length < 7) errors.push("A valid phone number is required.");
  if (!origin) errors.push("Origin address is required.");
  if (!destination) errors.push("Destination address is required.");
  if (!loadSize) errors.push("Load size is required.");
  if (!requestedMoveDate) errors.push("Move date is required.");
  if (requestedMoveDate && !normalizedMoveDate) errors.push("A valid move date is required.");

  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors.join(" ") }, { status: 400 });
  }

  const moveDate = normalizedMoveDate!;

  const quote = calculateDetailedPrice(loadSize, distanceKm, {
    fragileItems,
    heavyItems,
    stairFlights,
    elevatorAccess,
    packingHelp,
    assemblyHelp,
    longCarry,
    buildingType,
    carryFloor,
  });
  const estimatedCost = quote ? quote.total : 0;

  if (!isDatabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Booking service is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const conflictingBooking = await findBookingDateConflict(moveDate);
  if (conflictingBooking) {
    return Response.json(
      { ok: false, error: buildMoveDateConflictMessage(moveDate) },
      { status: 409 },
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
        fragileItems,
        heavyItems,
        stairFlights,
        elevatorAccess,
        packingHelp,
        assemblyHelp,
        longCarry,
        buildingType,
        carryFloor,
        estimatedCost: String(estimatedCost),
        targetBudget: targetBudget != null ? String(targetBudget) : null,
        negotiationNotes: negotiationNotes || null,
        notes: notes || null,
      })
      .returning({ id: bookings.id });
  } catch (err) {
    if (isMoveDateConflictError(err)) {
      return Response.json(
        { ok: false, error: buildMoveDateConflictMessage(moveDate) },
        { status: 409 },
      );
    }

    console.error("[bookings] db insert failed:", err);
    return Response.json({ ok: false, error: "Could not save your booking. Please try again." }, { status: 500 });
  }

  const quoteDetailsHtml = getQuoteDetailsList(
    {
      fragileItems,
      heavyItems,
      stairFlights,
      elevatorAccess,
      packingHelp,
      assemblyHelp,
      longCarry,
      buildingType,
      carryFloor,
      targetBudget,
      negotiationNotes,
    },
    { includeNegotiation: true },
  )
    .map((detail) => `<p><strong>${escapeHtml(detail.label)}:</strong> ${escapeHtml(detail.value)}</p>`)
    .join("");

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
    ${quoteDetailsHtml ? `<h3>Quote factors</h3>${quoteDetailsHtml}` : ""}
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
