import { createHash, timingSafeEqual } from "crypto";

const ADMIN_HEADER = "x-admin-password";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function createDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function isValidAdminPassword(password: string) {
  const expected = getAdminPassword();
  if (!expected || !password) return false;

  const expectedDigest = createDigest(expected);
  const actualDigest = createDigest(password);

  return timingSafeEqual(expectedDigest, actualDigest);
}

export function getAdminPasswordFromRequest(request: Request) {
  return request.headers.get(ADMIN_HEADER)?.trim() ?? "";
}

export function getAdminUnauthorizedResponse() {
  return Response.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
}

export function requireAdminRequest(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ ok: false, error: "Admin area is not configured." }, { status: 503 });
  }

  if (!isValidAdminPassword(getAdminPasswordFromRequest(request))) {
    return getAdminUnauthorizedResponse();
  }

  return null;
}
