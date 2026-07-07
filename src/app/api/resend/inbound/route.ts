import { escapeHtml, sendOwnerEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type ResendWebhookEvent = {
  type?: string;
  data?: {
    email_id?: string;
  };
};

type ReceivedEmail = {
  id: string;
  from?: string | null;
  to?: string[];
  subject?: string | null;
  html?: string | null;
  text?: string | null;
  created_at?: string;
  reply_to?: string[];
  headers?: Record<string, string>;
  attachments?: Array<{
    filename?: string | null;
    content_type?: string | null;
    size?: number | null;
  }>;
};

function extractEmailAddress(value?: string | null): string | undefined {
  if (!value) return undefined;
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0];
}

function formatAttachmentSize(size?: number | null): string {
  if (!size || size <= 0) return "size unknown";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchReceivedEmail(emailId: string): Promise<{ email?: ReceivedEmail; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { reason: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[resend/inbound] retrieve failed:", response.status, text);
      return { reason: `Provider responded ${response.status}` };
    }

    const email = (await response.json()) as ReceivedEmail;
    return { email };
  } catch (error) {
    console.error("[resend/inbound] retrieve error:", error);
    return { reason: "Receive lookup failed" };
  }
}

function buildForwardedEmailHtml(email: ReceivedEmail) {
  const attachmentItems =
    email.attachments?.length
      ? `<ul>${email.attachments
          .map((attachment) => {
            const filename = attachment.filename?.trim() || "unnamed attachment";
            const type = attachment.content_type?.trim() || "unknown type";
            return `<li>${escapeHtml(filename)} (${escapeHtml(type)}, ${escapeHtml(formatAttachmentSize(attachment.size))})</li>`;
          })
          .join("")}</ul>`
      : "<p>No attachments.</p>";

  const content =
    email.html?.trim() ||
    (email.text?.trim() ? `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(email.text)}</pre>` : "<p>No email body was provided.</p>");

  return `
    <h2>Inbound message for ${escapeHtml(site.publicEmail)}</h2>
    <p><strong>From:</strong> ${escapeHtml(email.headers?.from || email.from || "Unknown sender")}</p>
    <p><strong>To:</strong> ${escapeHtml(email.to?.join(", ") || site.publicEmail)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(email.subject || "(no subject)")}</p>
    ${email.created_at ? `<p><strong>Received:</strong> ${escapeHtml(new Date(email.created_at).toLocaleString("en-CA", { timeZone: "America/Toronto" }))}</p>` : ""}
    <p><strong>Attachments:</strong></p>
    ${attachmentItems}
    <hr />
    <div>${content}</div>
  `;
}

export async function POST(request: Request) {
  let event: ResendWebhookEvent;
  try {
    event = (await request.json()) as ResendWebhookEvent;
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return Response.json({ ok: true, ignored: true });
  }

  const emailId = event.data?.email_id?.trim();
  if (!emailId) {
    return Response.json({ ok: false, error: "Missing email id." }, { status: 400 });
  }

  const { email, reason } = await fetchReceivedEmail(emailId);
  if (!email) {
    return Response.json({ ok: false, error: reason || "Could not retrieve incoming email." }, { status: 500 });
  }

  const replyTo =
    email.reply_to?.find(Boolean) ||
    extractEmailAddress(email.headers?.["reply-to"]) ||
    extractEmailAddress(email.headers?.from) ||
    extractEmailAddress(email.from);

  const forwarded = await sendOwnerEmail({
    subject: `Inbound email: ${email.subject || "(no subject)"}`,
    html: buildForwardedEmailHtml(email),
    replyTo,
    idempotencyKey: `resend-inbound-${email.id}`,
  });

  if (!forwarded.delivered) {
    return Response.json({ ok: false, error: forwarded.reason || "Forwarding failed." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
