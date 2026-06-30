import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Booking } from "@/db/schema";
import {
  formatDateTime,
  formatMoveDate,
  getEffectiveBillAmount,
  getQuoteDetailsList,
} from "@/lib/bookings";
import { calculateDetailedPrice, formatCAD } from "@/lib/pricing";
import { site } from "@/lib/site";

type PdfBooking = Pick<
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
  | "estimatedCost"
  | "finalCost"
  | "targetBudget"
  | "negotiationNotes"
  | "notes"
  | "adminNotes"
  | "status"
  | "createdAt"
  | "confirmedAt"
>;

export async function createBookingPdf(booking: PdfBooking) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  let y = 748;

  function line(text: string, options?: { size?: number; bold?: boolean; color?: [number, number, number] }) {
    page.drawText(text, {
      x: 48,
      y,
      size: options?.size ?? 12,
      font: options?.bold ? bold : regular,
      color: rgb(...(options?.color ?? [0.12, 0.16, 0.22])),
    });
    y -= (options?.size ?? 12) + 8;
  }

  line(site.name, { size: 20, bold: true, color: [0.74, 0.12, 0.16] });
  line(`Booking summary #${booking.id}`, { size: 16, bold: true });
  line(`Generated ${formatDateTime(new Date())}`);
  y -= 4;

  line("Customer details", { bold: true });
  line(`Name: ${booking.fullName}`);
  line(`Email: ${booking.email}`);
  line(`Phone: ${booking.phone}`);
  line(`Status: ${booking.status}`);
  line(`Created: ${formatDateTime(booking.createdAt)}`);
  line(`Confirmed: ${formatDateTime(booking.confirmedAt)}`);
  y -= 6;

  line("Move details", { bold: true });
  line(`Move date: ${formatMoveDate(booking.moveDate)}`);
  line(`Origin: ${booking.origin}`);
  line(`Destination: ${booking.destination}`);
  line(`Distance: ${booking.distanceKm ?? 0} km`);

  const pricing = calculateDetailedPrice(booking.loadSize, booking.distanceKm ?? 0, booking);
  if (pricing) {
    line(`Load size: ${pricing.loadLabel}`);
    line(`Estimated quote: ${formatCAD(Number(booking.estimatedCost) || 0)}`);
  } else {
    line(`Load size key: ${booking.loadSize}`);
  }
  line(`Final bill: ${formatCAD(getEffectiveBillAmount(booking))}`);
  y -= 6;

  const quoteDetails = getQuoteDetailsList(booking, { includeNegotiation: true });
  if (quoteDetails.length > 0) {
    line("Custom quote details", { bold: true });
    for (const detail of quoteDetails) {
      line(`${detail.label}: ${detail.value}`);
    }
    y -= 6;
  }

  if (booking.notes) {
    line("Customer notes", { bold: true });
    for (const noteLine of booking.notes.split("\n")) {
      line(noteLine);
    }
    y -= 6;
  }

  if (booking.adminNotes) {
    line("Admin notes", { bold: true });
    for (const noteLine of booking.adminNotes.split("\n")) {
      line(noteLine);
    }
    y -= 6;
  }

  line(`Contact: ${site.phone} | ${site.email}`, { size: 10 });

  return pdf.save();
}
