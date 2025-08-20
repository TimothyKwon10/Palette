import { doc, getDoc, setDoc, arrayUnion, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../Firebase/firebase";
import useAuthUser from "../useAuthUser.jsx"
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "../Header.jsx";
import Heart from "../../assets/images/heart.png"
import HeartFilled from "../../assets/images/heart_filled.png"
import Expand from "../../assets/images/expand.png"
import WhiteCross from "../../assets/images/whiteCross.png"

function Image() {  
    const { user, checking } = useAuthUser();
    const { id } = useParams();
    const [image, setImage] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [heart, setHeart] = useState(false);

    const onLikeImage = async (id) => {
        const userRef = doc(db, "users", user.uid);
        setHeart(true);

        await setDoc(userRef, {
            likedImages: arrayUnion(id)
        }, { merge: true });
    }

    const onUnlikeImage = async (id) => {
        const userRef = doc(db, "users", user.uid);
        setHeart(false);
      
        await updateDoc(userRef, {
            likedImages: arrayRemove(id)
        });
    };

    const checkIfLiked = async (id) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const likedImages = userSnap.data().likedImages || [];
            const isLiked = likedImages.includes(id);
            setHeart(isLiked);
        } else {
            setHeart(false);
        }
    }

    useEffect(() => {
        if (user?.uid && id) checkIfLiked(id);
    }, [user?.uid, id]);

    useEffect(() => {
        const fetchImage = async () => {
                const docRef = doc(db, "generalImages", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setImage(docSnap.data());
                }
            };
        fetchImage();
    }, [id])

    useEffect(() => {
        if (!expanded) return;
      
        const handleEsc = (e) => {
          if (e.key === "Escape") {
            setExpanded(false);
          }
        };
      
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [expanded]);


    if (checking) {
        return <p>Loading auth...</p>; 
    }
    if (!image) return <p>Loading image...</p>;
    
    if (!user) {
        return (
            <div className = "px-6">
                <Header/>
                <div className = "mb-6"/>
    
                <main className="mx-auto max-w-6xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#ECEEF1]">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* LEFT: action bar */}
                            <div
                                className="
                                    flex justify-between p-4
                                    border-b border-[#ECEEF1]
                                    lg:flex-col lg:items-center lg:col-span-1 lg:px-4 lg:py-6
                                    lg:border-r lg:border-b-0
                                "
                            >
                                <div className = "flex lg:flex-col gap-6 items-center">
                                    {/* <button onClick = {clickHeart} className = "hover:scale-110 transition ease-in-out duration-200">
                                        {heart ? <img src = {HeartFilled} className = "h-6 w-auto"/> : <img src = {Heart} className = "h-6 w-auto"/>}
                                    </button> */}
                                    <button onClick = {() => setExpanded(true)} className = "hover:scale-110 transition ease-in-out duration-200 focus-visible:outline-none focus:outline-none focus:ring-0">
                                        <img src = {Expand} className = "h-6 w-auto"/>
                                    </button>
                                    {/* <button className = "bg-[#019cb9] py-2 px-3 rounded text-white hover:scale-[1.07] transition ease-in-out duration-200">
                                        Save
                                    </button> */}
                                </div>
                                <div className = "flex lg:flex-col gap-3">
                                    {(image.colors || []).map((hex) => (
                                        <div key={hex} className="flex flex-col items-center">
                                            <div className="relative group">
                                                {/* Color Circle */}
                                                <button
                                                aria-label={`Copy ${hex}`}
                                                onClick={() => navigator.clipboard?.writeText(hex)}
                                                className="h-8 w-8 rounded-full hover:scale-110 transition ease-in-out duration-200"
                                                style={{ backgroundColor: hex }}
                                                />
        
                                                {/* Tooltip */}
                                                <span
                                                className="absolute left-1/2 -translate-x-1/2
                                                            top-full mt-0
                                                            lg:top-auto lg:bottom-full lg:mb-1
                                                            px-2 py-1 rounded bg-[#ECEEF1] text-gray-500 text-xs
                                                            opacity-0 group-hover:opacity-100
                                                            transition-opacity duration-200
                                                            whitespace-nowrap pointer-events-none z-10"
                                                >
                                                {hex}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
        
                            {/* MIDDLE: image */}
                            <section className="lg:col-span-7 flex items-center justify-center p-4"
                                style={{ height: '80vh', width: '100%' }}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    className="block max-w-full max-h-[calc(80vh-2rem)] object-contain rounded"
                                />
        
                            </section>
        
                            {/* RIGHT: sidebar */}
                            <aside className="lg:col-span-4 bg-[#ECEEF1]">
                                <div className="p-6 lg:sticky lg:top-24">
                                <h1 className="text-2xl font-[PlayfairDisplay] font-semibold mb-3">
                                    {image.title || "Untitled"}
                                </h1>
        
                                {/* tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(image.tags || []).map((t) => (
                                    <span key={t} className="text-xs px-2 py-1 rounded-full bg-[#019cb9] text-white">
                                        # {t}
                                    </span>
                                    ))}
                                </div>
        
                                {/* comments */}
                                <div className="space-y-3 text-sm text-gray-600">
                                    <p className="text-gray-500">Comments go here…</p>
                                </div>
                            </div>
                        </aside>
                        </div>
                    </div>
                </main>
    
                {expanded && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <button
                            onClick={() => setExpanded(false)}
                            className="absolute top-2 left-2"
                            >
                                <div className = "bg-black/55 rounded-full p-[0.375rem] hover:scale-[1.07] transition ease-in-out duration-200">
                                    <img src = {WhiteCross} className = "h-6 w-auto"/>
                                </div>
                            </button>
                            <img src={image.url} className="rounded-lg max-h-[90vh] w-auto object-contain"/>
                        </div>
                    </div>
                )}
    
            </div>
        )
    }
    else { //logged in 
        return (
            <div className = "px-6">
                <Header/>
                <div className = "mb-6"/>
    
                <main className="mx-auto max-w-6xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#ECEEF1]">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* LEFT: action bar */}
                            <div
                                className="
                                    flex justify-between p-4
                                    border-b border-[#ECEEF1]
                                    lg:flex-col lg:items-center lg:col-span-1 lg:px-4 lg:py-6
                                    lg:border-r lg:border-b-0
                                "
                            >
                                <div className = "flex lg:flex-col gap-6 items-center">
                                <button
                                    onClick={() => heart ? onUnlikeImage(id) : onLikeImage(id)}
                                    className = "hover:scale-110 transition ease-in-out duration-200"
                                    >
                                    {heart
                                        ? <img src={HeartFilled} className="h-6 w-auto"/>
                                        : <img src={Heart} className="h-6 w-auto"/>}
                                </button>
                                    <button onClick = {() => setExpanded(true)} className = "hover:scale-110 transition ease-in-out duration-200 focus-visible:outline-none focus:outline-none focus:ring-0">
                                        <img src = {Expand} className = "h-6 w-auto"/>
                                    </button>
                                    <button className = "bg-[#019cb9] py-2 px-3 rounded text-white hover:scale-[1.07] transition ease-in-out duration-200">
                                        Save
                                    </button>
                                </div>
                                <div className = "flex lg:flex-col gap-3">
                                    {(image.colors || []).map((hex) => (
                                        <div key={hex} className="flex flex-col items-center">
                                            <div className="relative group">
                                                {/* Color Circle */}
                                                <button
                                                aria-label={`Copy ${hex}`}
                                                onClick={() => navigator.clipboard?.writeText(hex)}
                                                className="h-8 w-8 rounded-full hover:scale-110 transition ease-in-out duration-200"
                                                style={{ backgroundColor: hex }}
                                                />
        
                                                {/* Tooltip */}
                                                <span
                                                className="absolute left-1/2 -translate-x-1/2
                                                            top-full mt-0
                                                            lg:top-auto lg:bottom-full lg:mb-1
                                                            px-2 py-1 rounded bg-[#ECEEF1] text-gray-500 text-xs
                                                            opacity-0 group-hover:opacity-100
                                                            transition-opacity duration-200
                                                            whitespace-nowrap pointer-events-none z-10"
                                                >
                                                {hex}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
        
                            {/* MIDDLE: image */}
                            <section className="lg:col-span-7 flex items-center justify-center p-4"
                                style={{ height: '80vh', width: '100%' }}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    className="block max-w-full max-h-[calc(80vh-2rem)] object-contain rounded"
                                />
        
                            </section>
        
                            {/* RIGHT: sidebar */}
                            <aside className="lg:col-span-4 bg-[#ECEEF1]">
                                <div className="p-6 lg:sticky lg:top-24">
                                <h1 className="text-2xl font-[PlayfairDisplay] font-semibold mb-3">
                                    {image.title || "Untitled"}
                                </h1>
        
                                {/* tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(image.tags || []).map((t) => (
                                    <span key={t} className="text-xs px-2 py-1 rounded-full bg-[#019cb9] text-white">
                                        # {t}
                                    </span>
                                    ))}
                                </div>
        
                                {/* comments */}
                                <div className="space-y-3 text-sm text-gray-600">
                                    <p className="text-gray-500">Comments go here…</p>
                                </div>
                            </div>
                        </aside>
                        </div>
                    </div>
                </main>
    
                {expanded && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <button
                            onClick={() => setExpanded(false)}
                            className="absolute top-2 left-2"
                            >
                                <div className = "bg-black/55 rounded-full p-[0.375rem] hover:scale-[1.07] transition ease-in-out duration-200">
                                    <img src = {WhiteCross} className = "h-6 w-auto"/>
                                </div>
                            </button>
                            <img src={image.url} className="rounded-lg max-h-[90vh] w-auto object-contain"/>
                        </div>
                    </div>
                )}
    
            </div>
        )
    }
}

export default Image;