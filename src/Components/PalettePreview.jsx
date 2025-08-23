function PalettePreview({
  urls = [],
  title,
  variant,
  onEmptyClick,
}) {
  const layers = urls.slice(0, 3);
  while (layers.length < 3) layers.push(null);

  const Z = ["z-30", "z-20", "z-10"];
  const OFFSETS = [
    "translate-x-0 -translate-y-0",
    "translate-x-3 -translate-y-3",
    "translate-x-6 -translate-y-6",
  ];
  const INSET = "inset-6";

  return (
    <div className="group relative w-full aspect-square bg-white">
      {layers.map((url, i) => (
        <div
          key={`${url || "ph"}-${i}`}
          className={`absolute ${INSET} ${OFFSETS[i]} ${Z[i]}`}
        >
          <div className="relative w-full h-full overflow-hidden rounded-md ring-2 ring-white">
            {/* Image as background -> no intrinsic-size snap */}
            <div
              className={`absolute inset-0 ${
                url ? "bg-cover bg-center" : "bg-gray-300"
              }`}
              style={url ? { backgroundImage: `url(${url})` } : undefined}
            />
            {/* Hover darken overlay (doesn't affect ring) */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />

            {/* Title only on front card */}
            {i === 0 && title && (
              <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="inline-block truncate px-2 py-1 text-sm font-light text-white drop-shadow">
                  {title}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Empty CTA for variants */}
      {variant && urls.length === 0 && (
        <button
          type="button"
          onClick={onEmptyClick}
          aria-label={variant === "liked" ? "Browse to like images" : "Upload your first image"}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-transparent focus:outline-none"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-xs text-gray-700">
            {variant === "liked" ? "Browse & like" : "Upload your first image"}
          </span>
        </button>
      )}
    </div>
  );
}

export default PalettePreview;
