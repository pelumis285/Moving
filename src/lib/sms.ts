type SmsPayload = {
  to: string;
  body: string;
};

export function normalizePhoneNumberE164(value: string | null | undefined) {
  const input = (value ?? "").trim();
  if (!input) return null;

  if (input.startsWith("+")) {
    const normalized = `+${input.slice(1).replace(/\D/g, "")}`;
    return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
  }

  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return null;
}

export async function sendSms({ to, body }: SmsPayload): Promise<{ delivered: boolean; reason?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const configuredFrom = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !configuredFrom) {
    console.info(`[sms] Twilio is not configured — would have texted ${to}:\n${body}`);
    return { delivered: false, reason: "SMS provider not configured" };
  }

  const normalizedTo = normalizePhoneNumberE164(to);
  if (!normalizedTo) {
    return { delivered: false, reason: "Recipient phone number format is not supported" };
  }

  const normalizedFrom = normalizePhoneNumberE164(configuredFrom);
  if (!normalizedFrom) {
    return { delivered: false, reason: "TWILIO_FROM_NUMBER must be in E.164 format" };
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: normalizedTo,
        From: normalizedFrom,
        Body: body,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[sms] Twilio error:", res.status, text);
      return { delivered: false, reason: `Provider responded ${res.status}` };
    }

    return { delivered: true };
  } catch (error) {
    console.error("[sms] send failed:", error);
    return { delivered: false, reason: "Send failed" };
  }
}
