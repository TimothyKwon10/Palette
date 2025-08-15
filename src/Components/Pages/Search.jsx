import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchImgUrlsFromQuery } from "../../../functions/Services/fetchImgUrlsFromQuery.mjs";
import Header from "../Header.jsx";
import ImgMosaic from "../ImgMosaic.jsx";


function Search() {
    const location = useLocation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q");
        if (q) {
            setQuery(q);

            const getImageUrls = async () => {
                try {
                    const urls = await fetchImgUrlsFromQuery(q);
                    console.log(urls);
                    setResults(urls);
                } 
                catch (err) {
                    console.error("Fetch failed:", err);
                }
              };
          
            getImageUrls();
        }
      }, [location.search]);

    return (
        <div className = "px-6">
            <Header/>
            <div className="mb-6"></div>
            <ImgMosaic images = {results}/>
        </div>
    )
}

export default Search