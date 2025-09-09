export default async function handler(req, res) {
  console.log("Incoming request:", req.query);

  const { id } = req.query;
  const w = parseInt(req.query.w || "800", 10);

  if (!id || Array.isArray(id) || Number.isNaN(w)) {
    console.error("Bad request:", { id, w });
    res.status(400).send("Bad request");
    return;
  }

  const upstream = `https://www.artic.edu/iiif/2/${id}/full/${w},/0/default.jpg`;
  console.log("Fetching upstream:", upstream);

  try {
    const r = await fetch(upstream);
    if (!r.ok) {
      console.error("Upstream error:", r.status, r.statusText);
      res.status(r.status).send("Upstream error");
      return;
    }

    res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const buffer = Buffer.from(await r.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    console.error("Proxy error:", e);
    res.status(502).send("Proxy error: " + e.message);
  }
}
