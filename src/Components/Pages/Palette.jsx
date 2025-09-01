import Header from "../Header";
import ImgMosaic from "../ImgMosaic";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../FireBase/firebaseConfig.js";
import useAuthUser from "../useAuthUser.jsx";

function Palette() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthUser();

  useEffect(() => {
    if (!user?.uid || !id) return;

    async function fetchData() {
        setLoading(true);
        try {
            if (id === "Likes" || id === "YourUploads") {   
            const uRef = doc(db, "users", user.uid);
            const uSnap = await getDoc(uRef);
            const data = uSnap.exists() ? uSnap.data() : {};

            const raw = id === "Likes" ? data.likedImages || [] : data.user_uploads || [];
            const cleaned = Array.from(
                new Map(
                raw
                    .filter(x => x && typeof x.id === "string" && typeof x.url === "string")
                    .map(x => [x.id, { id: x.id, url: x.url }])
                ).values()
            );

            setImages(cleaned.reverse());
            } 
            else {
                const itemsRef = collection(db, "users", user.uid, "collections", id, "items");
                const q = query(itemsRef, orderBy("createdAt", "desc"));
                const snap = await getDocs(q);

                const rows = snap.docs
                    .map(docSnap => {
                    const d = docSnap.data();
                    return {
                        id: d.id ?? docSnap.id,
                        url: d.url ?? d.imageUrl ?? null,
                    };
                    })
                    .filter(x => typeof x.id === "string" && typeof x.url === "string");

                setImages(rows);
            }
        } 
        catch (err) {
            console.error("Error fetching images:", err);
            setImages([]);
        } 
        finally {
            setLoading(false);
        }
    }

    fetchData();
  }, [user?.uid, id]);

  return (
    <div className = "px-6">
      <Header />
      <div className="mb-6" />
      {loading ? (
        <p className="text-center text-gray-500">Loading images...</p>
      ) : (
        <ImgMosaic images={images} />
      )}
    </div>
  );
}

export default Palette;
