export function isAIC(url = "") {
  return typeof url === "string" && /artic\.edu\/iiif\/2\//.test(url);
}

function extractAicId(url = "") {
  const match = url.match(/iiif\/2\/([^/]+)/);
  return match ? match[1] : null;
}

// point this at your Railway service base URL
const RAILWAY_API_BASE = "https://vectorsearch-production-d8b5.up.railway.app";

export function resolveImage(url = "", isMobile = false) {
  if (isAIC(url)) {
    const id = extractAicId(url);
    if (!id) return url; // fallback

    const width = isMobile ? 600 : 1200;
    return `${RAILWAY_API_BASE}/cai?id=${id}&w=${width}`;
  }

  return url;
}