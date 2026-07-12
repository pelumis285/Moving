import { suggestAddresses } from "@/lib/distance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ ok: true, suggestions: [] });
  }

  try {
    const suggestions = await suggestAddresses(query);
    return Response.json({ ok: true, suggestions });
  } catch (error) {
    console.error("[address-suggestions] lookup failed:", error);
    return Response.json(
      { ok: false, error: "We could not load address suggestions right now." },
      { status: 500 },
    );
  }
}
