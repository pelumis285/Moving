const SITE_TIME_ZONE = "America/Toronto";

function formatDatePart(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not format the current date.");
  }

  return `${year}-${month}-${day}`;
}

export function getTodayInSiteTimeZone(now: Date = new Date()) {
  return formatDatePart(now, SITE_TIME_ZONE);
}

export function isDateBeforeTodayInSiteTimeZone(value: string, now: Date = new Date()) {
  return value < getTodayInSiteTimeZone(now);
}
