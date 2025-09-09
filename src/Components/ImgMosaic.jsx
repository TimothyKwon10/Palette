import { useEffect, useRef, useState, useCallback } from "react";
import { collection, query, orderBy, startAt, startAfter, limit, getDocs } from "firebase/firestore"
import { db } from '../FireBase/firebaseConfig.js';
import Masonry from 'react-masonry-css';
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { resolveImage } from "./imageUrls.jsx";

function ImgMosaic({ images: propImages }) {
    const [images, setImages] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingFirst, setLoadingFirst] = useState(true);
    const CHUNK = 40;

    const seedRef = useRef(Math.random());
    const lastDocRef = useRef(null); 
    const wrappedRef = useRef(false);
    const fetchingRef = useRef(false);
  
    useEffect(() => {
        if (propImages !== undefined) {
            setImages(propImages.slice(0, CHUNK));
            setHasMore(propImages.length > CHUNK);
            setLoadingFirst(false);
            return;
        }
      
        let cancelled = false;
        (async () => {
          setImages([]);
          setHasMore(true);
          setLoadingFirst(true);
          seedRef.current = Math.random();
          lastDocRef.current = null;
          wrappedRef.current = false;
      
          try {
            const first = await fetchRandomPage({
              seed: seedRef.current,
              afterSnap: null,
              wrapped: false,
              pageSize: CHUNK,
            });
      
            if (!cancelled) {
              setImages(first.chunk);
              lastDocRef.current = first.lastDoc;
              wrappedRef.current = first.wrapped;
              setHasMore(first.hasMore);
            }
          } finally {
            if (!cancelled) setLoadingFirst(false);
          }
        })();
      
        return () => {
          cancelled = true;
        };
    }, [propImages]);
  
    const navigate = useNavigate();
  
    const fetchNext = useCallback(async () => {
        if (fetchingRef.current || !hasMore) return;
        fetchingRef.current = true;
        try {
          if (propImages && propImages.length > 0) {
            // client-side infinite scroll
            const nextSlice = propImages.slice(images.length, images.length + CHUNK);
            setImages((prev) => [...prev, ...nextSlice]);
            setHasMore(images.length + CHUNK < propImages.length);
          } else {
            // Firestore infinite scroll
            const next = await fetchRandomPage({
              seed: seedRef.current,
              afterSnap: lastDocRef.current,
              wrapped: wrappedRef.current,
              pageSize: CHUNK,
            });
    
            setImages((prev) => [...prev, ...next.chunk]);
            lastDocRef.current = next.lastDoc;
            wrappedRef.current = next.wrapped;
            setHasMore(next.hasMore);
          }
        } finally {
          fetchingRef.current = false;
        }
    }, [propImages, hasMore, images.length]);
  
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches;

    return (
        <InfiniteScroll
          dataLength = {images.length}
          next = {fetchNext}
          hasMore = {hasMore}
          scrollThreshold = "1400px"
        >
            <Masonry
            breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
            >
            {images.map(img => (
                <div key={img.id} className="mb-4 rounded-lg bg-gray-200 overflow-hidden">
                  <button onClick={() => navigate(`/image/${img.id}`)} className="block w-full">
                      <img
                      src={resolveImage(img.url, isMobile)}
                      alt={img.title || ""}
                      width={img.width}
                      height={img.height}
                      className="w-full h-auto object-cover"
                      />
                  </button>
                </div>
            ))}
            </Masonry>
        </InfiniteScroll>
    );

    async function fetchRandomPage({ seed, afterSnap, wrapped, pageSize }) {
        const col = collection(db, "generalImages");
      
        if (!wrapped) {
          let q;
          if (!afterSnap) {
            // first page of the session
            q = query(col, orderBy("rand"), startAt(seed), limit(pageSize));
          } else {
            // subsequent pages in the first segment
            q = query(col, orderBy("rand"), startAfter(afterSnap), limit(pageSize));
          }
      
          const snap = await getDocs(q);
          const chunk = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
          if (snap.size === pageSize) {
            return {
              chunk,
              lastDoc: snap.docs[snap.docs.length - 1],
              wrapped: false,
              hasMore: true
            };
          }
          if (chunk.length > 0) {
            return {
              chunk,
              lastDoc: null,
              wrapped: true,
              hasMore: true
            };
          }
      
          // If nothing came back (e.g., seed is greater than max rand), go straight to wrapped segment.
          wrapped = true;
        }
      
        let q2;
        if (!afterSnap) {
          q2 = query(col, orderBy("rand"), startAt(0), limit(pageSize));
        } else {
          q2 = query(col, orderBy("rand"), startAfter(afterSnap), limit(pageSize));
        }
      
        const snap2 = await getDocs(q2);
        const chunk2 = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
      
        return {
          chunk: chunk2,
          lastDoc: snap2.docs[snap2.docs.length - 1] || null,
          wrapped: true,
          hasMore: snap2.size === pageSize
        };
    }
  }
  
  export default ImgMosaic;