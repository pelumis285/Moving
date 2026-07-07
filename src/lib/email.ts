import { site } from "./site";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  idempotencyKey?: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
};

/**
 * Sends an email notification to the business owner.
 *
 * Uses the Resend HTTP API when RESEND_API_KEY is configured. The recipient
 * is taken from NOTIFY_EMAIL (falling back to the site contact email).
 * When no API key is present the message is logged server-side so the app
 * keeps working in development / preview without external secrets.
 */
export async function sendEmail({ to, subject, html, replyTo, idempotencyKey, attachments }: EmailPayload): Promise<{
  delivered: boolean;
  reason?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || `${site.name} <onboarding@resend.dev>`;

  if (!apiKey) {
    console.info(
      `[email] RESEND_API_KEY not set — would have emailed ${Array.isArray(to) ? to.join(", ") : to}:\nSubject: ${subject}\nAttachments: ${
        attachments?.map((attachment) => attachment.filename).join(", ") || "none"
      }\n${html}`,
    );
    return { delivered: false, reason: "Email provider not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments?.length ? { attachments } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[email] Resend error:", res.status, text);
      return { delivered: false, reason: `Provider responded ${res.status}` };
    }

    return { delivered: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { delivered: false, reason: "Send failed" };
  }
}

export async function sendOwnerEmail({
  subject,
  html,
  replyTo,
  attachments,
}: Omit<EmailPayload, "to">): Promise<{ delivered: boolean; reason?: string }> {
  return sendEmail({
    to: process.env.NOTIFY_EMAIL || site.operationsEmail,
    subject,
    html,
    replyTo,
    attachments,
  });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
