import { getDb, isDatabaseConfigured } from "@/db";
import { contacts } from "@/db/schema";
import { sendOwnerEmail, escapeHtml } from "@/lib/email";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
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

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  const errors: string[] = [];
  if (name.length < 2) errors.push("Name is required.");
  if (!isEmail(email)) errors.push("A valid email is required.");
  if (message.length < 5) errors.push("Please enter a message.");

  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors.join(" ") }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Contact service is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let inserted;
  try {
    [inserted] = await getDb()
      .insert(contacts)
      .values({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      })
      .returning({ id: contacts.id });
  } catch (err) {
    console.error("[contact] db insert failed:", err);
    return Response.json({ ok: false, error: "Could not send your message. Please try again." }, { status: 500 });
  }

  const html = `
    <h2>New Contact Message #${inserted?.id ?? ""}</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
    ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p>Sent from ${site.name} contact form.</p>
  `;

  const emailResult = await sendOwnerEmail({
    subject: subject ? `Contact: ${subject}` : `New Contact Message from ${name}`,
    html,
    replyTo: email,
  });

  return Response.json({ ok: true, id: inserted?.id, emailDelivered: emailResult.delivered });
}
