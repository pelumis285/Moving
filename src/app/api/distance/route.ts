import { estimateDistanceKm } from "@/lib/distance";

export const dynamic = "force-dynamic";

type Body = {
  origin?: string;
  destination?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const origin = (body.origin ?? "").trim();
  const destination = (body.destination ?? "").trim();

  if (origin.length < 6 || destination.length < 6) {
    return Response.json(
      { ok: false, error: "Please enter both the origin and destination addresses." },
      { status: 400 },
    );
  }

  try {
    const estimate = await estimateDistanceKm(origin, destination);

    if (!estimate) {
      return Response.json(
        { ok: false, error: "We could not estimate the distance for those addresses." },
        { status: 404 },
      );
    }

    return Response.json({
      ok: true,
      distanceKm: estimate.distanceKm,
      source: estimate.source,
    });
  } catch (error) {
    console.error("[distance] estimate failed:", error);
    return Response.json(
      { ok: false, error: "We could not calculate the distance right now. Please try again." },
      { status: 500 },
    );
  }
}
