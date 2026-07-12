import { suggestAddresses } from "@/lib/distance";

export const dynamic = "force-dynamic";

function extractBiasContext(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return "";
  }

  const city = parts[1] ?? "";
  const province =
    parts.find((part) => /\bOntario\b|\bON\b/i.test(part)) ??
    "Ontario";
  const country =
    parts.find((part) => /\bCanada\b/i.test(part)) ??
    "Canada";

  return [city, province, country].filter(Boolean).join(", ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const bias = searchParams.get("bias")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ ok: true, suggestions: [] });
  }

  try {
    const biasContext = extractBiasContext(bias);
    const suggestions = await suggestAddresses(biasContext ? `${query}, ${biasContext}` : query);
    return Response.json({ ok: true, suggestions });
  } catch (error) {
    console.error("[address-suggestions] lookup failed:", error);
    return Response.json(
      { ok: false, error: "We could not load address suggestions right now." },
      { status: 500 },
    );
  }
}
