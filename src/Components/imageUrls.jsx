// Detect if it's an CAI IIIF URL
export function isAIC(url) {
  return /artic\.edu\/iiif\/2\//.test(url);
}

// Resize CAI IIIF images by width
export function aicSized(url, width) {
  const m = url.match(/^(https?:\/\/[^/]+\/iiif\/2\/[^/]+)/);
  const base = m ? m[1] : null;
  return base ? `${base}/full/${width},/0/default.jpg` : url;
}

export function resolveImage(url, isMobile) {
  if (!isAIC(url)) return url;
  return aicSized(url, isMobile ? 600 : 1200);
}