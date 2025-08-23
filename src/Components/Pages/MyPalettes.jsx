import Header from "../Header.jsx"
import useAuthUser from "../useAuthUser.jsx"
import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../FireBase/firebaseConfig.js";
import PalettePreview from "../PalettePreview.jsx";
import { useNavigate } from "react-router-dom";

function MyPalettes() {
    const { user } = useAuthUser();
    const [genPalettes, setGenPalettes] = useState([]);
    const [likedPalettes, setLikedPalettes] = useState([]);
    const [userUploadPalettes, setUserUploadPalettes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const goHome = () => navigate("/Home");
    const goCreate = () => navigate("/Create")

    async function fetchLikedImages() {
      if (!user) return;
    
      const uRef = doc(db, "users", user.uid);
      const uSnap = await getDoc(uRef);
    
      const liked = uSnap.exists() ? uSnap.data().likedImages || [] : [];
    
      const cleaned = Array.from(
        new Map(
          liked
            .filter(x => x && typeof x.id === "string" && typeof x.url === "string")
            .map(x => [x.id, { id: x.id, url: x.url }])
        ).values()
      );
    
      cleaned.reverse();
      setLikedPalettes(cleaned);
    }

    async function fetchUserUploads() {
      if (!user) return;
    
      const uRef = doc(db, "users", user.uid);
      const uSnap = await getDoc(uRef);
    
      const userUploads = uSnap.exists() ? uSnap.data().user_uploads || [] : [];
    
      const cleaned = Array.from(
        new Map(
          userUploads
            .filter(x => x && typeof x.id === "string" && typeof x.url === "string")
            .map(x => [x.id, { id: x.id, url: x.url }])
        ).values()
      );
    
      cleaned.reverse();
      setUserUploadPalettes(cleaned);
    }

    useEffect(() => {
        if (!user) return;

        (async () => {
          setLoading(true);
          const colRef = collection(db, "users", user.uid, "collections");
          const snapCol = await getDocs(colRef);
          setGenPalettes(snapCol.docs.map(d => ({ id: d.id, ...d.data() })));

          await Promise.all([
            fetchLikedImages(),
            fetchUserUploads(),
          ]);

          setLoading(false);
        })();
      }, [user]);
    
    return (
        <div className = "px-6">
            <Header/>
            <div className = "mb-6"/>

            <h1 className="text-center text-4xl font-[PlayfairDisplay] mb-10">My Palettes</h1>
          {loading ? (
            <p className="text-center text-gray-500">Loading palettes...</p>
            ) : genPalettes.length > 0 || likedPalettes.length > 0 || userUploadPalettes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <PalettePreview key = "Liked" urls = {likedPalettes.slice(0, 3).map(x => x.url)} title = "Liked images" variant = "liked" onEmptyClick = {() => goHome()}/>
              <PalettePreview key = "User Upload" urls = {userUploadPalettes.slice(0, 3).map(x => x.url)} title = "Your uploads" variant = "user upload" onEmptyClick = {() => goCreate()}/>
              {genPalettes.map(col => {
                const urls = (col.preview?.length ? col.preview : [{ url: col.coverImageUrl }]).map(x => x.url);
                return <PalettePreview key={col.id} urls={urls} title={col.name} />;
              })}
            </div>
            ) : (
            <div className="flex items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center bg-[#ECEEF1] w-[80vw] h-[70vh] rounded-lg">
                <div className="flex flex-col items-center justify-center border border-gray-500 w-[33%] h-[80%] rounded-lg">
                  <p className="text-gray-500 font-semibold">No palettes yet</p>
                  <p className="text-gray-500">Save or like an image to create your first Palette.</p>
                  <button
                    onClick={goHome}
                    className="py-2 px-4 rounded mt-5 bg-[#019cb9] text-white hover:bg-[#017d96] duration-500 ease-in-out transition-transform transform hover:scale-[1.03]"
                  >
                    Browse to begin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    )
}

export default MyPalettes;