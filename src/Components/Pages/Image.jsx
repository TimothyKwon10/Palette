import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/firebase";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "../Header.jsx";
import Heart from "../../assets/images/heart.png"
import HeartFilled from "../../assets/images/heart_filled.png"
import Expand from "../../assets/images/expand.png"

function Image() {
    const { id } = useParams();
    const [image, setImage] = useState(null);

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

    if (!image) return <p>Loading...</p>;

    return (
        <div className = "px-6">
            <Header/>
            <div className = "mb-6"/>

            <main className="mx-auto max-w-6xl px-4">
            {/* ONE shared card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* LEFT: action bar */}
                    <div className = "flex lg:flex-col lg:items-center lg:col-span-1 lg:border-r lg:border-b-0 lg:border-gray-200 sm:border-b sm:border-gray-200 px-4 py-6 gap-6">
                        <button>
                            <img src = {Heart} className = "h-6 w-auto"/>
                        </button>
                        <button>
                            <img src = {Expand} className = "h-6 w-auto"/>
                        </button>
                        <button className = "bg-[#019cb9] py-2 px-3 rounded text-white">
                            Save
                        </button>
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
                    <aside className="lg:col-span-4 bg-gray-100">
                        <div className="p-6 lg:sticky lg:top-24">
                        <h1 className="text-xl font-[PlayfairDisplay] font-semibold mb-3">
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

        </div>
    )
}

export default Image;