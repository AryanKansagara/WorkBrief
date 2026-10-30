export async function POST(request: Request) {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return Response.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") ?? 0) > 24000)
    return Response.json({ error: "Request too large" }, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 12000)
      return Response.json({ error: "Request too large" }, { status: 413 });
    const payload = JSON.parse(raw);
    if (
      typeof payload.notes !== "string" ||
      !payload.notes.trim() ||
      payload.notes.length > 6000
    )
      return Response.json(
        { error: "Supply 1–6,000 characters of notes." },
        { status: 400 },
      );
    const upstream = await fetch(
      `${process.env.BRIEF_SERVICE_URL ?? "http://127.0.0.1:8089"}/brief`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: payload.notes }),
        signal: AbortSignal.timeout(35000),
        cache: "no-store",
      },
    );
    const body = await upstream.json();
    return Response.json(body, { status: upstream.status });
  } catch {
    return Response.json(
      {
        error:
          "Brief service unavailable or request invalid. Check the Python service.",
      },
      { status: 502 },
    );
  }
}
