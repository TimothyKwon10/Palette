import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchImgUrlsFromQuery } from "../fetchImgUrlsFromQuery.mjs";
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
            setResults(fetchImgUrlsFromQuery(query));
        }
      }, [location]);

    return (
        <div className = "px-6">
            <Header/>
            <ImgMosaic images = {results}/>
        </div>
    )
}

export default Search