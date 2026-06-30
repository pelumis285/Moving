import { randomBytes } from "crypto";
import type { Booking } from "@/db/schema";
import { escapeHtml } from "@/lib/email";
import {
  calculateDetailedPrice,
  formatCAD,
  getBuildingTypeLabel,
  getLongCarryLabel,
} from "@/lib/pricing";
import { site } from "@/lib/site";

export const RESCHEDULE_WAIT_DAYS = 3;
export const RESCHEDULE_TOKEN_TTL_DAYS = 30;

type BookingEmailShape = Pick<
  Booking,
  | "id"
  | "fullName"
  | "email"
  | "phone"
  | "origin"
  | "destination"
  | "loadSize"
  | "moveDate"
  | "distanceKm"
  | "fragileItems"
  | "heavyItems"
  | "stairFlights"
  | "elevatorAccess"
  | "packingHelp"
  | "assemblyHelp"
  | "longCarry"
  | "buildingType"
  | "carryFloor"
  | "estimatedCost"
  | "finalCost"
  | "targetBudget"
  | "negotiationNotes"
  | "notes"
  | "adminNotes"
  | "createdAt"
>;

export function normalizeMoveDate(value: string) {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;

  const date = new Date(`${normalized}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  return normalized;
}

export function formatMoveDate(value: string) {
  const normalized = normalizeMoveDate(value);
  if (!normalized) return value;

  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${normalized}T12:00:00.000Z`));
}

export function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function createRescheduleToken() {
  return randomBytes(24).toString("hex");
}

export function getRescheduleTokenExpiry(from = new Date()) {
  return new Date(from.getTime() + RESCHEDULE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function canOfferRescheduleLink(createdAt: Date, now = new Date()) {
  return now.getTime() >= createdAt.getTime() + RESCHEDULE_WAIT_DAYS * 24 * 60 * 60 * 1000;
}

export function getRescheduleUrl(token: string) {
  return `${site.url}/reschedule?token=${encodeURIComponent(token)}`;
}

export function parseMoney(value: string | number | null | undefined) {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return null;

  return Math.round(amount * 100) / 100;
}

export function getEffectiveBillAmount(booking: Pick<Booking, "estimatedCost" | "finalCost">) {
  return parseMoney(booking.finalCost) ?? parseMoney(booking.estimatedCost) ?? 0;
}

type QuoteDetailsInput = {
  fragileItems: number;
  heavyItems: number;
  stairFlights: number;
  elevatorAccess: boolean;
  packingHelp: boolean;
  assemblyHelp: boolean;
  longCarry: string | null | undefined;
  buildingType: string | null | undefined;
  carryFloor: number;
  targetBudget: string | number | null | undefined;
  negotiationNotes: string | null | undefined;
};

export function getQuoteDetailsList(
  booking: QuoteDetailsInput,
  options?: { includeNegotiation?: boolean },
) {
  const details: Array<{ label: string; value: string }> = [];

  if (booking.fragileItems > 0) {
    details.push({ label: "Fragile items", value: String(booking.fragileItems) });
  }

  if (booking.heavyItems > 0) {
    details.push({ label: "Heavy / oversized items", value: String(booking.heavyItems) });
  }

  if (booking.stairFlights > 0) {
    details.push({ label: "Stair flights", value: String(booking.stairFlights) });
  }

  if (booking.elevatorAccess) {
    details.push({ label: "Elevator access", value: "Available" });
  }

  if (booking.packingHelp) {
    details.push({ label: "Packing help", value: "Requested" });
  }

  if (booking.assemblyHelp) {
    details.push({ label: "Furniture assembly", value: "Requested" });
  }

  if (booking.longCarry !== "standard") {
    details.push({ label: "Access type", value: getLongCarryLabel(booking.longCarry) });
  }

  if (booking.buildingType !== "house-ground") {
    details.push({ label: "Pickup building type", value: getBuildingTypeLabel(booking.buildingType) });
  }

  if (booking.carryFloor > 0) {
    details.push({ label: "Pickup floor", value: String(booking.carryFloor) });
  }

  const targetBudget = parseMoney(booking.targetBudget);
  if (options?.includeNegotiation && targetBudget != null) {
    details.push({ label: "Target budget", value: formatCAD(targetBudget) });
  }

  if (options?.includeNegotiation && booking.negotiationNotes) {
    details.push({ label: "Negotiation request", value: booking.negotiationNotes });
  }

  return details;
}

function detailRow(label: string, value: string) {
  return `<p><strong>${escapeHtml(label)}:</strong> ${value}</p>`;
}

function buildBillingHtml(booking: BookingEmailShape) {
  const quote = calculateDetailedPrice(booking.loadSize, booking.distanceKm ?? 0, booking);
  const finalAmount = getEffectiveBillAmount(booking);
  const totalKm = Math.max(0, Math.round(booking.distanceKm ?? 0));
  const rows = [
    detailRow("Final bill", formatCAD(finalAmount)),
    detailRow("Estimated quote", formatCAD(parseMoney(booking.estimatedCost) ?? 0)),
  ];

  if (quote) {
    rows.push(detailRow("Load size", escapeHtml(quote.loadLabel)));
    rows.push(detailRow("Distance", `${totalKm} km total (${quote.billableKm} billable)`));
  }

  for (const detail of getQuoteDetailsList(booking)) {
    rows.push(detailRow(detail.label, escapeHtml(detail.value)));
  }

  return rows.join("");
}

export function buildBookingConfirmationEmail(
  booking: BookingEmailShape,
  options: { rescheduleUrl?: string | null },
) {
  return `
    <h2>Your move with ${escapeHtml(site.name)} has been confirmed</h2>
    ${detailRow("Booking reference", `#${booking.id}`)}
    ${detailRow("Customer", escapeHtml(booking.fullName))}
    ${detailRow("Move date", escapeHtml(formatMoveDate(booking.moveDate)))}
    ${detailRow("Origin", escapeHtml(booking.origin))}
    ${detailRow("Destination", escapeHtml(booking.destination))}
    ${detailRow("Phone", escapeHtml(booking.phone))}
    <hr/>
    <h3>Billing details</h3>
    ${buildBillingHtml(booking)}
    ${booking.notes ? detailRow("Customer notes", escapeHtml(booking.notes).replace(/\n/g, "<br/>")) : ""}
    ${booking.adminNotes ? detailRow("Admin notes", escapeHtml(booking.adminNotes).replace(/\n/g, "<br/>")) : ""}
    ${
      options.rescheduleUrl
        ? `<p>You can request a moving date change here: <a href="${options.rescheduleUrl}">${options.rescheduleUrl}</a></p>`
        : `<p>Online rescheduling is unlocked ${RESCHEDULE_WAIT_DAYS} days after the original booking date. Contact us directly if you need to change the date sooner.</p>`
    }
    <hr/>
    <p>Questions? Reply to this email or contact ${escapeHtml(site.name)} at <a href="mailto:${escapeHtml(site.publicEmail)}">${escapeHtml(site.publicEmail)}</a>.</p>
  `;
}

export function buildCustomerRescheduleEmail(booking: BookingEmailShape) {
  return `
    <h2>Your move date has been updated</h2>
    ${detailRow("Booking reference", `#${booking.id}`)}
    ${detailRow("Customer", escapeHtml(booking.fullName))}
    ${detailRow("New move date", escapeHtml(formatMoveDate(booking.moveDate)))}
    ${detailRow("Origin", escapeHtml(booking.origin))}
    ${detailRow("Destination", escapeHtml(booking.destination))}
    ${detailRow("Current bill", formatCAD(getEffectiveBillAmount(booking)))}
    <p>If anything else changes, please contact ${escapeHtml(site.name)} directly.</p>
  `;
}

export function buildOwnerRescheduleNoticeEmail(booking: BookingEmailShape, previousMoveDate: string) {
  return `
    <h2>Booking #${booking.id} changed move date</h2>
    ${detailRow("Customer", escapeHtml(booking.fullName))}
    ${detailRow("Email", escapeHtml(booking.email))}
    ${detailRow("Phone", escapeHtml(booking.phone))}
    ${detailRow("Previous date", escapeHtml(formatMoveDate(previousMoveDate)))}
    ${detailRow("New date", escapeHtml(formatMoveDate(booking.moveDate)))}
    ${detailRow("Origin", escapeHtml(booking.origin))}
    ${detailRow("Destination", escapeHtml(booking.destination))}
  `;
}
