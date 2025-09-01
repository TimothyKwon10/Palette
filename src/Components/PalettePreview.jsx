import { useNavigate } from "react-router-dom";
import { useState } from "react";

function PalettePreview({ urls = [], title, variant, onEmptyClick, id }) {
  const navigate = useNavigate();

  const clickPath =
    variant === "liked"
      ? "/Palette/Likes"
      : variant === "user upload"
      ? "/Palette/YourUploads"
      : id
      ? `/Palette/${id}`
      : "/Palette";

  const handleClick = () => navigate(clickPath);

  const layers = urls.slice(0, 3);
  while (layers.length < 3) layers.push(null);

  const Z = ["z-30", "z-20", "z-10"];
  const OFFSETS = [
    "translate-x-0 -translate-y-0",
    "translate-x-3 -translate-y-3",
    "translate-x-6 -translate-y-6",
  ];
  const INSET = "inset-6";

  const [hoverCount, setHoverCount] = useState(0);
  const anyHovered = hoverCount > 0;

  return (
    <div className="relative w-full aspect-square bg-white">
      {layers.map((url, i) => (
        <button
          key={`${url || "ph"}-${i}`}
          className={`absolute ${INSET} ${OFFSETS[i]} ${Z[i]} block w-auto h-auto group`}
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setHoverCount((c) => c + 1)}
          onMouseLeave={() => setHoverCount((c) => Math.max(0, c - 1))}
        >
          <div className="relative w-full h-full overflow-hidden rounded-md ring-2 ring-white">
            <div
              className={`absolute inset-0 ${
                url ? "bg-cover bg-center" : "bg-gray-300"
              } pointer-events-none`}
              style={url ? { backgroundImage: `url(${url})` } : undefined}
            />

            <div
              className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${
                anyHovered ? "bg-black/30" : "bg-black/0"
              }`}
            />
            {i === 0 && title && (
              <div
                className={`absolute top-2 left-2 z-20 transition-opacity duration-200 pointer-events-none ${
                  anyHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="inline-block truncate px-2 py-1 text-sm font-light text-white drop-shadow">
                  {title}
                </span>
              </div>
            )}
          </div>
        </button>
      ))}

      {variant && urls.length === 0 && (
        <button
          type="button"
          onClick={onEmptyClick}
          aria-label={
            variant === "liked" ? "Browse to like images" : "Upload your first image"
          }
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
