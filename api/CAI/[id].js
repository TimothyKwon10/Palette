export default async function handler(req, res) {
  const { id } = req.query;
  const w = parseInt(req.query.w || "800", 10);

  if (!id || Array.isArray(id) || Number.isNaN(w)) {
    res.status(400).send("Bad request");
    return;
  }

  const upstream = `https://www.artic.edu/iiif/2/${id}/full/${w},/0/default.jpg`;

  try {
    const r = await fetch(upstream);
    if (!r.ok) {
      res.status(r.status).send("Upstream error");
      return;
    }

    res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const buffer = Buffer.from(await r.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    res.status(502).send("Proxy error: " + e.message);
  }
}
