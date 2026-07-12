import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Booking } from "@/db/schema";
import {
  formatDateTime,
  formatMoveDate,
  getEffectiveBillAmount,
  getQuoteDetailsList,
  parseMoney,
} from "@/lib/bookings";
import { formatDistanceKm } from "@/lib/distance-format";
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
  | "buildingType"
  | "carryFloor"
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

type SectionRow = {
  label: string;
  value: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 36;
const SECTION_GAP = 16;
const COLUMN_GAP = 18;
const SECTION_HEADER_HEIGHT = 24;
const SECTION_PADDING_X = 14;
const SECTION_PADDING_Y = 12;
const LABEL_SIZE = 8.5;
const VALUE_SIZE = 11;
const VALUE_LINE_HEIGHT = 14;
const LABEL_LINE_HEIGHT = 12;
const ROW_GAP = 8;
const COLORS = {
  ink: rgb(0.11, 0.14, 0.19),
  slate: rgb(0.32, 0.36, 0.43),
  border: rgb(0.85, 0.88, 0.92),
  panel: rgb(0.97, 0.98, 0.99),
  white: rgb(1, 1, 1),
  red: rgb(0.86, 0.15, 0.19),
  navy: rgb(0.1, 0.17, 0.31),
  gold: rgb(0.89, 0.7, 0.27),
  success: rgb(0.1, 0.47, 0.29),
};

let logoBytesPromise: Promise<Buffer | null> | null = null;

function getBookingReference(id: number) {
  return `SURFT-${String(id).padStart(6, "0")}`;
}

export function getBookingPdfFilename(id: number) {
  return `surftmove-booking-${String(id).padStart(6, "0")}.pdf`;
}

async function getLogoBytes() {
  if (!logoBytesPromise) {
    logoBytesPromise = readFile(path.join(process.cwd(), "public", "logo-surftmove-red.png")).catch(() => null);
  }

  return logoBytesPromise;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const normalized = text.replace(/\r/g, "").split("\n");
  const lines: string[] = [];

  for (const paragraph of normalized) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
        current = next;
        continue;
      }

      if (current) {
        lines.push(current);
        current = word;
        continue;
      }

      let chunk = "";
      for (const char of word) {
        const nextChunk = `${chunk}${char}`;
        if (font.widthOfTextAtSize(nextChunk, fontSize) <= maxWidth) {
          chunk = nextChunk;
        } else {
          lines.push(chunk);
          chunk = char;
        }
      }
      current = chunk;
    }

    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function measureSectionHeight(rows: SectionRow[], regular: PDFFont, width: number) {
  const contentWidth = width - SECTION_PADDING_X * 2;
  let height = SECTION_HEADER_HEIGHT + SECTION_PADDING_Y * 2;

  rows.forEach((row, index) => {
    const valueLines = wrapText(row.value, regular, VALUE_SIZE, contentWidth);
    height += LABEL_LINE_HEIGHT + valueLines.length * VALUE_LINE_HEIGHT;
    if (index < rows.length - 1) height += ROW_GAP;
  });

  return height;
}

function drawSection(
  page: PDFPage,
  fonts: { bold: PDFFont; regular: PDFFont },
  options: { x: number; y: number; width: number; title: string; rows: SectionRow[]; height?: number },
) {
  const height = options.height ?? measureSectionHeight(options.rows, fonts.regular, options.width);
  const contentWidth = options.width - SECTION_PADDING_X * 2;

  page.drawRectangle({
    x: options.x,
    y: options.y - height,
    width: options.width,
    height,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: options.x,
    y: options.y - SECTION_HEADER_HEIGHT,
    width: options.width,
    height: SECTION_HEADER_HEIGHT,
    color: COLORS.navy,
  });

  page.drawText(options.title.toUpperCase(), {
    x: options.x + SECTION_PADDING_X,
    y: options.y - 16,
    font: fonts.bold,
    size: 10,
    color: COLORS.white,
  });

  let cursorY = options.y - SECTION_HEADER_HEIGHT - SECTION_PADDING_Y - LABEL_LINE_HEIGHT + 2;

  for (const row of options.rows) {
    page.drawText(row.label.toUpperCase(), {
      x: options.x + SECTION_PADDING_X,
      y: cursorY,
      font: fonts.bold,
      size: LABEL_SIZE,
      color: COLORS.slate,
    });
    cursorY -= LABEL_LINE_HEIGHT;

    const valueLines = wrapText(row.value, fonts.regular, VALUE_SIZE, contentWidth);
    for (const line of valueLines) {
      page.drawText(line, {
        x: options.x + SECTION_PADDING_X,
        y: cursorY,
        font: fonts.regular,
        size: VALUE_SIZE,
        color: COLORS.ink,
      });
      cursorY -= VALUE_LINE_HEIGHT;
    }

    cursorY -= ROW_GAP;
  }

  return height;
}

function drawBarcode(page: PDFPage, value: string, x: number, y: number, width: number, height: number) {
  const units: number[] = [];

  for (const char of value) {
    const code = char.charCodeAt(0);
    for (let bit = 0; bit < 7; bit += 1) {
      units.push(((code >> bit) & 1) === 1 ? 2 : 1);
      units.push(1);
    }
    units.push(2);
  }

  const totalUnits = units.reduce((sum, unit) => sum + unit, 0);
  const unitWidth = width / totalUnits;
  let cursorX = x;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  });

  units.forEach((unit, index) => {
    const barWidth = unit * unitWidth;
    if (index % 2 === 0) {
      page.drawRectangle({
        x: cursorX,
        y: y + 2,
        width: Math.max(1, barWidth),
        height: height - 4,
        color: COLORS.ink,
      });
    }
    cursorX += barWidth;
  });
}

function drawContinuationHeader(
  page: PDFPage,
  fonts: { bold: PDFFont; regular: PDFFont },
  options: {
    logoImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null;
    bookingReference: string;
  },
) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLORS.panel,
  });

  page.drawRectangle({
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - PAGE_MARGIN - 78,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    height: 78,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });
  page.drawRectangle({
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - PAGE_MARGIN - 6,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    height: 6,
    color: COLORS.red,
  });

  if (options.logoImage) {
    const logoWidth = 132;
    const logoHeight = (options.logoImage.height / options.logoImage.width) * logoWidth;
    page.drawImage(options.logoImage, {
      x: PAGE_MARGIN + 16,
      y: PAGE_HEIGHT - PAGE_MARGIN - 52,
      width: logoWidth,
      height: logoHeight,
    });
  } else {
    page.drawText(site.name, {
      x: PAGE_MARGIN + 16,
      y: PAGE_HEIGHT - PAGE_MARGIN - 38,
      font: fonts.bold,
      size: 18,
      color: COLORS.red,
    });
  }

  page.drawText("ADDITIONAL BOOKING DETAILS", {
    x: PAGE_WIDTH - PAGE_MARGIN - 224,
    y: PAGE_HEIGHT - PAGE_MARGIN - 30,
    font: fonts.bold,
    size: 16,
    color: COLORS.navy,
  });
  page.drawText(`Document No. ${options.bookingReference}`, {
    x: PAGE_WIDTH - PAGE_MARGIN - 224,
    y: PAGE_HEIGHT - PAGE_MARGIN - 48,
    font: fonts.regular,
    size: 10,
    color: COLORS.ink,
  });
}

export async function createBookingPdf(booking: PdfBooking) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const logoBytes = await getLogoBytes();
  const logoImage = logoBytes ? await pdf.embedPng(logoBytes) : null;
  const bookingReference = getBookingReference(booking.id);
  const pricing = calculateDetailedPrice(booking.loadSize, booking.distanceKm ?? 0, booking);
  const serviceConditionDetails = getQuoteDetailsList(booking);
  const quoteDetails = getQuoteDetailsList(booking, { includeNegotiation: true });
  const finalBill = getEffectiveBillAmount(booking);
  const estimatedQuote = parseMoney(booking.estimatedCost) ?? 0;
  const statusLabel = booking.status === "confirmed" ? "Confirmed" : booking.status;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLORS.panel,
  });

  const headerX = PAGE_MARGIN;
  const headerTop = PAGE_HEIGHT - PAGE_MARGIN;
  const headerWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const headerHeight = 142;

  page.drawRectangle({
    x: headerX,
    y: headerTop - headerHeight,
    width: headerWidth,
    height: headerHeight,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: headerX,
    y: headerTop - 6,
    width: headerWidth,
    height: 6,
    color: COLORS.red,
  });

  if (logoImage) {
    const logoWidth = 180;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
    page.drawImage(logoImage, {
      x: headerX + 18,
      y: headerTop - 70,
      width: logoWidth,
      height: logoHeight,
    });
  } else {
    page.drawText(site.name, {
      x: headerX + 18,
      y: headerTop - 42,
      font: bold,
      size: 24,
      color: COLORS.red,
    });
  }

  page.drawText(site.tagline, {
    x: headerX + 18,
    y: headerTop - 86,
    font: regular,
    size: 11,
    color: COLORS.slate,
  });
  page.drawText(`Service area: ${site.serviceArea}`, {
    x: headerX + 18,
    y: headerTop - 104,
    font: regular,
    size: 10,
    color: COLORS.ink,
  });
  page.drawText(`Email: ${site.publicEmail}`, {
    x: headerX + 18,
    y: headerTop - 120,
    font: regular,
    size: 10,
    color: COLORS.ink,
  });
  page.drawText(`Phone: ${site.phone}`, {
    x: headerX + 18,
    y: headerTop - 136,
    font: regular,
    size: 10,
    color: COLORS.ink,
  });

  const summaryCardWidth = 192;
  const summaryCardX = headerX + headerWidth - summaryCardWidth - 18;
  const summaryCardY = headerTop - 16;
  const summaryCardHeight = 112;

  page.drawRectangle({
    x: summaryCardX,
    y: summaryCardY - summaryCardHeight,
    width: summaryCardWidth,
    height: summaryCardHeight,
    color: COLORS.navy,
  });
  page.drawText("BOOKING", {
    x: summaryCardX + 16,
    y: summaryCardY - 26,
    font: bold,
    size: 13,
    color: COLORS.gold,
  });
  page.drawText("CONFIRMATION", {
    x: summaryCardX + 16,
    y: summaryCardY - 44,
    font: bold,
    size: 18,
    color: COLORS.white,
  });
  page.drawText(`Document No. ${bookingReference}`, {
    x: summaryCardX + 16,
    y: summaryCardY - 68,
    font: regular,
    size: 10,
    color: COLORS.white,
  });
  page.drawText(`Move Date: ${formatMoveDate(booking.moveDate)}`, {
    x: summaryCardX + 16,
    y: summaryCardY - 86,
    font: regular,
    size: 10,
    color: COLORS.white,
  });

  page.drawRectangle({
    x: summaryCardX + 16,
    y: summaryCardY - 106,
    width: 88,
    height: 18,
    color: booking.status === "confirmed" ? COLORS.success : COLORS.red,
  });
  page.drawText(statusLabel.toUpperCase(), {
    x: summaryCardX + 26,
    y: summaryCardY - 100,
    font: bold,
    size: 9,
    color: COLORS.white,
  });

  const stripY = headerTop - headerHeight - 20;
  const stripHeight = 56;

  page.drawRectangle({
    x: PAGE_MARGIN,
    y: stripY - stripHeight,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    height: stripHeight,
    color: COLORS.navy,
  });
  page.drawText("Booking No:", {
    x: PAGE_MARGIN + 18,
    y: stripY - 21,
    font: regular,
    size: 11,
    color: COLORS.white,
  });
  page.drawText(bookingReference, {
    x: PAGE_MARGIN + 86,
    y: stripY - 24,
    font: bold,
    size: 18,
    color: COLORS.gold,
  });

  const barcodeWidth = 172;
  drawBarcode(page, bookingReference, PAGE_WIDTH - PAGE_MARGIN - barcodeWidth - 18, stripY - 36, barcodeWidth, 22);
  page.drawText(bookingReference, {
    x: PAGE_WIDTH - PAGE_MARGIN - barcodeWidth - 4,
    y: stripY - 48,
    font: bold,
    size: 9,
    color: COLORS.white,
  });

  const availableWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const columnWidth = (availableWidth - COLUMN_GAP) / 2;
  let cursorY = stripY - stripHeight - 18;

  const customerRows: SectionRow[] = [
    { label: "Customer", value: booking.fullName },
    { label: "Email", value: booking.email },
    { label: "Phone", value: booking.phone },
    { label: "Created", value: formatDateTime(booking.createdAt) },
    { label: "Confirmed", value: formatDateTime(booking.confirmedAt) },
  ];

  const moveRows: SectionRow[] = [
    { label: "Move date", value: formatMoveDate(booking.moveDate) },
    { label: "Origin", value: booking.origin },
    { label: "Destination", value: booking.destination },
    { label: "Distance", value: formatDistanceKm(booking.distanceKm ?? 0) },
    { label: "Status", value: statusLabel },
  ];

  const customerHeight = measureSectionHeight(customerRows, regular, columnWidth);
  const moveHeight = measureSectionHeight(moveRows, regular, columnWidth);
  const firstRowHeight = Math.max(customerHeight, moveHeight);

  drawSection(page, { bold, regular }, {
    x: PAGE_MARGIN,
    y: cursorY,
    width: columnWidth,
    title: "Customer Details",
    rows: customerRows,
    height: firstRowHeight,
  });
  drawSection(page, { bold, regular }, {
    x: PAGE_MARGIN + columnWidth + COLUMN_GAP,
    y: cursorY,
    width: columnWidth,
    title: "Move Details",
    rows: moveRows,
    height: firstRowHeight,
  });
  cursorY -= firstRowHeight + SECTION_GAP;

  const serviceRows: SectionRow[] = pricing
    ? [
        { label: "Load size", value: pricing.loadLabel },
        { label: "Crew & labour", value: `${pricing.movers} movers · ~${pricing.estHours} hrs at ${formatCAD(pricing.hourlyRate)}/hr` },
        { label: "Travel", value: `${formatDistanceKm(pricing.billableKm)} · ${formatCAD(pricing.travelCost)}` },
        ...pricing.travelBands.map((band) => ({
          label: band.label,
          value: `${formatDistanceKm(band.distanceKm)} @ ${formatCAD(band.rate)}/km = ${formatCAD(band.cost)}`,
        })),
        {
          label: "Access conditions",
          value:
            serviceConditionDetails.length > 0
              ? serviceConditionDetails.map((detail) => detail.value).join(" · ")
              : "Standard access",
        },
      ]
    : [
        { label: "Load size", value: booking.loadSize },
        { label: "Travel", value: `${formatDistanceKm(booking.distanceKm ?? 0)} total route` },
        {
          label: "Access conditions",
          value:
            serviceConditionDetails.length > 0
              ? serviceConditionDetails.map((detail) => detail.value).join(" · ")
              : "Standard access",
        },
      ];

  const billingRows: SectionRow[] = [
    { label: "Final bill", value: formatCAD(finalBill) },
    { label: "Estimated quote", value: formatCAD(estimatedQuote) },
    ...(pricing
      ? [
          { label: "Base handling", value: formatCAD(pricing.baseFee) },
          { label: "Labour", value: formatCAD(pricing.labour) },
          { label: "Travel charge", value: formatCAD(pricing.travelCost) },
          { label: "Adjustments", value: formatCAD(pricing.adjustmentsTotal) },
          { label: "HST", value: formatCAD(pricing.hst) },
        ]
      : []),
  ];

  const serviceHeight = measureSectionHeight(serviceRows, regular, columnWidth);
  const billingHeight = measureSectionHeight(billingRows, regular, columnWidth);
  const secondRowHeight = Math.max(serviceHeight, billingHeight);

  drawSection(page, { bold, regular }, {
    x: PAGE_MARGIN,
    y: cursorY,
    width: columnWidth,
    title: "Service Summary",
    rows: serviceRows,
    height: secondRowHeight,
  });
  drawSection(page, { bold, regular }, {
    x: PAGE_MARGIN + columnWidth + COLUMN_GAP,
    y: cursorY,
    width: columnWidth,
    title: "Billing Summary",
    rows: billingRows,
    height: secondRowHeight,
  });
  cursorY -= secondRowHeight + SECTION_GAP;

  const quoteRows: SectionRow[] =
    pricing?.adjustments.length
      ? pricing.adjustments.map((adjustment) => ({
          label: adjustment.label,
          value: formatCAD(adjustment.amount),
        }))
      : [{ label: "Adjustments", value: "No custom surcharges were applied to this booking." }];

  if (quoteDetails.length > 0 && !pricing?.adjustments.length) {
    quoteRows.push(...quoteDetails);
  }

  if (pricing?.adjustments.length && parseMoney(booking.targetBudget) != null) {
    quoteRows.push({ label: "Target budget", value: formatCAD(parseMoney(booking.targetBudget) ?? 0) });
  }

  if (pricing?.adjustments.length && booking.negotiationNotes) {
    quoteRows.push({ label: "Negotiation request", value: booking.negotiationNotes });
  }

  const notesRows: SectionRow[] = [
    ...(booking.notes ? [{ label: "Customer notes", value: booking.notes }] : []),
    ...(booking.adminNotes ? [{ label: "Admin notes", value: booking.adminNotes }] : []),
  ];

  const quoteSectionHeight = measureSectionHeight(quoteRows, regular, availableWidth);
  const notesSectionHeight = notesRows.length > 0 ? measureSectionHeight(notesRows, regular, availableWidth) : 0;
  const footerReserve = 88;
  let sectionPage = page;

  if (cursorY - (quoteSectionHeight + (notesSectionHeight ? notesSectionHeight + SECTION_GAP : 0) + footerReserve) < PAGE_MARGIN) {
    sectionPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawContinuationHeader(sectionPage, { bold, regular }, { logoImage, bookingReference });
    cursorY = PAGE_HEIGHT - PAGE_MARGIN - 96;
  }

  drawSection(sectionPage, { bold, regular }, {
    x: PAGE_MARGIN,
    y: cursorY,
    width: availableWidth,
    title: "Quote Factors",
    rows: quoteRows,
    height: quoteSectionHeight,
  });
  cursorY -= quoteSectionHeight + SECTION_GAP;

  if (notesRows.length > 0) {
    drawSection(sectionPage, { bold, regular }, {
      x: PAGE_MARGIN,
      y: cursorY,
      width: availableWidth,
      title: "Additional Notes",
      rows: notesRows,
      height: notesSectionHeight,
    });
    cursorY -= notesSectionHeight + SECTION_GAP;
  }

  const footerY = Math.max(PAGE_MARGIN + 44, cursorY - 8);

  sectionPage.drawText("Authorized by Surftmove dispatch", {
    x: PAGE_MARGIN,
    y: footerY + 26,
    font: regular,
    size: 10,
    color: COLORS.slate,
  });
  sectionPage.drawLine({
    start: { x: PAGE_MARGIN, y: footerY + 18 },
    end: { x: PAGE_MARGIN + 170, y: footerY + 18 },
    thickness: 1.2,
    color: COLORS.navy,
  });
  sectionPage.drawText("Booking support", {
    x: PAGE_MARGIN + 220,
    y: footerY + 26,
    font: regular,
    size: 10,
    color: COLORS.slate,
  });
  sectionPage.drawText(`${site.phone} · ${site.publicEmail}`, {
    x: PAGE_MARGIN + 220,
    y: footerY + 12,
    font: bold,
    size: 10,
    color: COLORS.ink,
  });
  sectionPage.drawText("Please keep this PDF for your records. Final billing reflects the confirmed move details above.", {
    x: PAGE_MARGIN,
    y: footerY - 6,
    font: italic,
    size: 9,
    color: COLORS.slate,
  });

  drawBarcode(sectionPage, bookingReference, PAGE_MARGIN, PAGE_MARGIN, 220, 26);
  sectionPage.drawText(bookingReference, {
    x: PAGE_MARGIN + 62,
    y: PAGE_MARGIN - 12,
    font: bold,
    size: 9,
    color: COLORS.ink,
  });

  return pdf.save();
}
