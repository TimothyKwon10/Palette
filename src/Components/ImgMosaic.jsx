import { useState, useEffect} from "react";
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../FireBase/firebaseConfig.js';
import Masonry from 'react-masonry-css';
import { useNavigate } from "react-router-dom";
import useAuthUser from "./useAuthUser.jsx"

function ImgMosaic({ images: propImages }) {
    const { user, checking } = useAuthUser();
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            if (propImages) {
                setImages(propImages);
                return;
            }
    
            if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const feed = userDoc.data().personal_feed || [];
                    setImages(feed);
                }
            } 

            else {
                // fallback to general images collection if not logged in
                const snapshot = await getDocs(collection(db, "generalImages"));
                const imgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                url: doc.data().url,
                }));
                setImages(imgs);
            }
        };
    
        fetchImages();
      }, [user, propImages]);

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    const navigate = useNavigate();

    if (checking) {
        return <p>Loading auth...</p>; 
    }
    return (
        <div>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {images.map((img) => ( //create image card for each of the different urls 
                    <button
                        key={img.id}
                        onClick={() => navigate(`/image/${img.id}`)}
                    >
                        <img
                            src = {img.url}
                            loading = "lazy"
                            className = "rounded-lg w-full"
                        />
                    </button>
                ))}
            </Masonry>
        </div>
    )
}

export default ImgMosaic; 