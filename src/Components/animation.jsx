import { useState, useRef, useEffect } from "react";
import Add from "../assets/images/add.png";

export default function NewPaletteControl({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate?.(trimmed);
    setName("");
    setOpen(false);
  };

  // Auto-focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Collapse on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
        setName(""); // optional: clear on collapse
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="w-full" ref={containerRef}>
      <form
        className="w-full flex items-center justify-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            // focus after layout applies
            requestAnimationFrame(() => inputRef.current?.focus());
            return;
          }
          handleCreate();
        }}
      >
        {/* Expanding input */}
        <div
          className={[
            "flex-1 min-w-0 overflow-hidden",
            "transition-[max-width,opacity] duration-500 ease-in-out",
            open ? "max-w-full opacity-100" : "max-w-0 opacity-0",
          ].join(" ")}
          aria-hidden={!open}
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Palette name"
            className="placeholder:text-gray-500 w-full px-3 py-2 
                       border border-gray-300 rounded 
                       focus:outline-none 
                       focus:border-[#fa5902] focus:border-2 focus:ring-0"
          />
        </div>

        {/* Add button + tooltip (button centers when input is hidden due to justify-center on parent) */}
        <div className="relative group flex-shrink-0">
          <button
            type="submit"
            aria-expanded={open}
            aria-label={open ? "Create palette" : "Add palette"}
            className="bg-[#fa5902] p-3 rounded-lg transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={open && !name.trim()} // when open, require a name
          >
            <img src={Add} className="h-5 w-5" />
          </button>

          {/* Tooltip styled like a rounded label, anchored to avoid cutoff */}
          <div
                className="absolute left-1/2 -translate-x-1/2
                top-auto bottom-full mb-1
                px-2 py-1 rounded bg-[#ECEEF1] text-gray-500 text-xs
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                whitespace-nowrap pointer-events-none z-10"
            >
            {open ? "Create" : "Add Palette"}
          </div>
        </div>
      </form>
    </div>
  );
}
