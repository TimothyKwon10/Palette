import { useState, useEffect} from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../FireBase/firebase.js';
import Masonry from 'react-masonry-css';

function ImgMosaic({ images: propImages }) {
    const [images, setImages] = useState([]);

    //On load, run useEffect once to retrieve the images from the db 
    useEffect(() => {
        if (!propImages) {
            const fetchImages = async() => {
                const snapshot = await getDocs(collection(db, "generalImages")) //retrieves a snapshot of all the documents from generalImages db
                const imgUrls = snapshot.docs.map(doc => doc.data().url); //retrieve and store only the urls

                setImages(imgUrls);
            };
        
            fetchImages();
        }
    }, [propImages]);

    const displayedImages = propImages || images;

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    return (
        <div>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {displayedImages.map((url, index) => ( //create image card for each of the different urls 
                    <img
                        key = {index}
                        src = {url}
                        loading = "lazy"
                        className = "rounded-lg w-full"
                    />
                ))}
            </Masonry>
        </div>
    )
}

export default ImgMosaic; 