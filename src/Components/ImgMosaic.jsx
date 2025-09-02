import { useMemo, useState, useEffect} from "react";
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../FireBase/firebaseConfig.js';
import Masonry from 'react-masonry-css';
import { useNavigate } from "react-router-dom";
import useAuthUser from "./useAuthUser.jsx"
import InfiniteScroll from "react-infinite-scroll-component";

function ImgMosaic({ images: propImages }) {
    const { user, checking } = useAuthUser();
    const [images, setImages] = useState([]);
    const [visibleCount, setVisibleCount] = useState(50);
    const CHUNK = 50;
  
    useEffect(() => {
      const fetchImages = async () => {
        if (propImages) {
          setImages(propImages);
          return;
        }
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setImages(userDoc.data().personal_feed || []);
          }
        } else {
          const snapshot = await getDocs(collection(db, "generalImages"));
          const imgs = snapshot.docs.map(d => ({ id: d.id, url: d.data().url }));
          setImages(imgs);
        }
      };
      fetchImages();
    }, [user, propImages]);
  
    // reset visibleCount when a new image list arrives
    useEffect(() => {
      setVisibleCount(Math.min(CHUNK, images.length));
    }, [images]);
  
    const visibleImages = useMemo(
      () => images.slice(0, visibleCount),
      [images, visibleCount]
    );
  
    const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
    const navigate = useNavigate();
  
    if (checking) return <p>Loading auth...</p>;
  
    return (
      <div>
        <InfiniteScroll
          dataLength={visibleImages.length}
          next={() => setVisibleCount(c => Math.min(c + CHUNK, images.length))}
          hasMore={visibleImages.length < images.length}
          loader={<p className="text-center text-sm text-gray-500 py-4">Loading more...</p>}
        >
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {visibleImages.map(img => (
                <button key={img.id} onClick={() => navigate(`/image/${img.id}`)}>
                    <img src={img.url} loading="lazy" className="rounded-lg w-full" />
                </button>
                ))}
            </Masonry>
        </InfiniteScroll>
      </div>
    );
  }
  
  export default ImgMosaic;