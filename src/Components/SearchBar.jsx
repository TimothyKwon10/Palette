import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const clearSearch = () => setSearchText("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      const encodedQuery = encodeURIComponent(searchText.trim());
      navigate(`/search?q=${encodedQuery}`);
    }
  };  

  return (
    <div className="relative w-full">
      <input
        type="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="SEARCH"
        className="w-full pl-10 pr-10 py-2 rounded border border-1 border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#026C7B] focus:border-none"
        onKeyDown = {handleKeyDown}
      />

        {/* Search icon (left) */}
        <svg
            xmlns = "http://www.w3.org/2000/svg"
            className = "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"
            fill = "none"
            viewBox = "0 0 24 24"
            stroke = "currentColor"
        >
        <path
            strokeLinecap = "round"
            strokeLinejoin = "round"
            strokeWidth = {2}
            d = "M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
        />
        </svg>

        {/* Custom X button (right) */}
        {searchText && (
            <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2
                        text-zinc-500 hover:bg-zinc-300 rounded-full
                        w-6 h-6 flex items-center justify-center text-lg transition"
            >
                ×
            </button>
        )}
    </div>
  );
}

export default SearchBar;
