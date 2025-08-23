import { doc, getDoc, setDoc, arrayUnion, updateDoc, arrayRemove, collection, 
    addDoc, getDocs, serverTimestamp,
    increment, runTransaction} from "firebase/firestore";
import { db } from "../../FireBase/firebaseConfig.js";
import useAuthUser from "../useAuthUser.jsx"
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "../Header.jsx";
import Heart from "../../assets/images/heart.png"
import HeartFilled from "../../assets/images/heart_filled.png"
import Expand from "../../assets/images/expand.png"
import WhiteCross from "../../assets/images/whiteCross.png"
import Animation from "../animation.jsx"

function Image() {  
    const { user, checking } = useAuthUser();
    const { id } = useParams();
    const [image, setImage] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [saveStatus, setSaveStatus] = useState(false);
    const [heart, setHeart] = useState(false);

    const [collections, setCollections] = useState([]);
    const [draftCollections, setDraftCollections] = useState([]);
    const [draftSelected, setDraftSelected] = useState([]);
    const [isSaving, setIsSaving] = useState(false);


    const openSaveModal = () => {
        setDraftCollections([...collections]);
        setDraftSelected([]);
        setSaveStatus(true);
    };

    const toggleDraftSelection = (collectionId) => {
        setDraftSelected(prev =>
            prev.includes(collectionId)
            ? prev.filter(id => id !== collectionId)
            : [...prev, collectionId]
        );
    };

    const onCreateDraftCollection = (name, imageId, imageUrl) => {

        const exists = draftCollections.find(col => col.name.trim().toLowerCase() === name.trim().toLowerCase());

        if (exists) {
            setDraftSelected(prev =>
                prev.includes(exists.id) ? prev : [...prev, exists.id]
            );

            setDraftCollections(prev => 
                prev.map(col => col.id === exists.id ? {
                    ...col,
                    coverImageUrl: imageUrl,
                    coverImageId: imageId
                } : col)
            )
            return;
        }
        else {
            const tmpId = `tmp-${Date.now()}`;
            const newDraftCollection = {
                id: tmpId,
                name: name,
                type: "custom",
                coverImageUrl: imageUrl,
                coverImageId: imageId,
                imageCount: 0
            }

            setDraftCollections(prev => [...prev, newDraftCollection]);
            setDraftSelected(prev => [...prev, tmpId]);
        }
    }

    const saveImagesToCollections = async () => {
        if (isSaving) {
            return;
        }
        setIsSaving(true);

        try {
            const idMap = {}; // tempId -> realId
        
            for (const c of draftCollections) {
              if (c.id.startsWith("tmp-") && draftSelected.includes(c.id)) {
                const colRef = collection(db, "users", user.uid, "collections");
                const created = await addDoc(colRef, {
                  name: c.name,
                  type: "custom",
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  imageCount: 0,
                });
                idMap[c.id] = created.id;
              }
            }
        
            const selectedRealIds = draftSelected.map(id => {
                if (idMap[id] !== undefined && idMap[id] !== null) {
                    return idMap[id]; //use new firebase id 
                } 
                else {
                    return id; //use pre-existing firebase id (already a collection within fire store)
                }
            });
        
            await Promise.all(selectedRealIds.map(async (cid) => {
                const collDocRef = doc(db, "users", user.uid, "collections", cid);
                const itemRef = doc(db, "users", user.uid, "collections", cid, "items", id);
            
                await runTransaction(db, async (tx) => {
                    const [collSnap, itemSnap] = await Promise.all([
                      tx.get(collDocRef),
                      tx.get(itemRef),
                    ]);
                  
                    if (!itemSnap.exists()) {
                      tx.set(itemRef, {
                        id,
                        url: image.url,
                        title: image.title ?? null,
                        tags: image.tags ?? [],
                        createdAt: serverTimestamp(),
                      });
                  
                      const prev = (collSnap.data()?.preview || []).filter(p => p.id !== id);
                      const preview = [{ id, url: image.url }, ...prev].slice(0, 3);
                  
                      tx.update(collDocRef, {
                        updatedAt: serverTimestamp(),
                        imageCount: increment(1),
                        coverImageUrl: preview[0]?.url ?? image.url,
                        coverImageId:  preview[0]?.id  ?? id,
                        preview,
                      });
                    }
                });
            }));
        
            setCollections(prev => {
              const updated = [...prev];
              for (const [tmpId, realId] of Object.entries(idMap)) {
                const draft = draftCollections.find(c => c.id === tmpId);
                updated.push({
                  id: realId,
                  name: draft.name,
                  type: "custom",
                  imageCount: 1,
                  coverImageUrl: image.url,
                  coverImageId: id,
                });
              }
              return updated;
            });
        
            setSaveStatus(false);
            setDraftCollections([]);
            setDraftSelected([]);
        
        } 
        catch (err) {
            console.error("Error saving images:", err);
        }

        finally {
            setIsSaving(false);
        }
    }

    const onLikeImage = async (id, url) => {
        const userRef = doc(db, "users", user.uid);
        setHeart(true);
      
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          const current = snap.exists() ? snap.data().likedImages || [] : [];
      
          // already liked
          const exists = current.some((x) => x.id === id);
          if (exists) return;
      
          const next = [...current, { id, url }];
          if (snap.exists()) {
            tx.update(userRef, { likedImages: next });
          } else {
            tx.set(userRef, { likedImages: next });
          }
        });
      };
      
      const onUnlikeImage = async (id) => {
        const userRef = doc(db, "users", user.uid);
        setHeart(false);
      
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) return;
      
          const current = snap.data().likedImages || [];
          const next = current.filter((x) => x.id !== id);
      
          tx.update(userRef, { likedImages: next });
        });
      };
      
      const checkIfLiked = async (id) => {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
      
        if (!snap.exists()) return setHeart(false);
      
        const liked = snap.data().likedImages || [];
        const isLiked = liked.some((x) => x.id === id);
        setHeart(isLiked);
      };
  

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
        if (!expanded && !saveStatus) return;
      
        const handleEsc = (e) => {
          if (e.key === "Escape") {
            setExpanded(false);
            setSaveStatus(false);
            setDraftSelected([]);
            setDraftCollections([])
          }
        };
      
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [expanded, saveStatus]);

    useEffect(() => {
        if (!user) return;

        const fetchCollections = async () => {
            try {
                const colRef = collection(db, "users", user.uid, "collections");
                const snap = await getDocs(colRef);
                const list = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
        
                setCollections(list);
            } catch (error) {
                console.error("Error fetching collections:", error);
            }
        };

            fetchCollections();
    }, [user])

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
                                    className="block max-w-full max-h-[calc(80vh-2rem)] object-contain"
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
                            <img src={image.url} className = "max-h-[90vh] w-auto object-contain"/>
                        </div>
                    </div>
                )}
    
            </div>
        )
    }
    else { //---------------------------------------------------logged in---------------------------------------------------------
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
                                    onClick={() => heart ? onUnlikeImage(id) : onLikeImage(id, image.url)}
                                    className = "hover:scale-110 transition ease-in-out duration-200"
                                    >
                                    {heart
                                        ? <img src={HeartFilled} className="h-6 w-auto"/>
                                        : <img src={Heart} className="h-6 w-auto"/>}
                                </button>
                                    <button onClick = {() => setExpanded(true)} className = "hover:scale-110 transition ease-in-out duration-200 focus-visible:outline-none focus:outline-none focus:ring-0">
                                        <img src = {Expand} className = "h-6 w-auto"/>
                                    </button>
                                    <button onClick = {() => openSaveModal()} className = "bg-[#019cb9] py-2 px-3 rounded text-white hover:scale-[1.07] transition ease-in-out duration-200">
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
                                    className="block max-w-full max-h-[calc(80vh-2rem)] object-contain"
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
                            <img src={image.url} className = "max-h-[90vh] w-auto object-contain"/>
                        </div>
                    </div>
                )}

                {saveStatus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 ">
                    {/* modal shell: no overflow here, make it a column */}
                    <div className="relative w-[90vw] max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-lg flex flex-col">

                        {/* close */}
                        <button
                            onClick={() => {
                                setSaveStatus(false);
                                setDraftSelected([]);
                                setDraftCollections([]);
                                }
                            }
                            className="absolute top-2 left-2 z-50"
                        >
                            <div className="bg-black/55 rounded-full p-[0.375rem] hover:scale-[1.07] transition ease-in-out duration-200">
                                <img src={WhiteCross} className="h-6 w-auto" />
                            </div>
                        </button>

                        {/* header (fixed) */}
                        <div className="relative px-4 py-6">
                            <h1 className="text-center text-3xl font-[PlayfairDisplay]">
                                Save to Palette
                            </h1>

                            {/* Submit button pinned top-right */}
                            <button
                                className={`absolute top-6 right-6
                                            py-2 px-4 rounded
                                            ${draftSelected.length > 0 
                                                ? "bg-[#019cb9] text-white hover:bg-[#017d96] duration-500 ease-in-out transition-transform transform hover:scale-[1.03]" 
                                                : "bg-[#ECEEF1] text-gray-400"}`}
                                disabled = {draftSelected.length === 0}
                                onClick = {() => saveImagesToCollections()}
                            >
                                Save
                            </button>
                        </div>

                        {/* middle content (scrollable) */}
                        <div className="flex-1 overflow-y-auto px-6 pb-3">
                            {draftCollections.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                    {draftCollections.map((c) => (
                                        <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleDraftSelection(c.id)}
                                        className={`group flex flex-col relative w-full rounded-lg
                                            ${draftSelected.includes(c.id) 
                                            ? "bg-gradient-to-br from-[#019cb9] via-[#b8e6e0] to-[#fa5902] p-[3px]" 
                                            : "bg-[#ECEEF1] p-[3px]"}`}
                                        >
                                        {/* Image container */}
                                        <div className="relative aspect-square w-full rounded-t-md overflow-hidden">
                                            {c.coverImageUrl ? (
                                            <img
                                                src={c.coverImageUrl}
                                                alt={c.name || "Collection cover"}
                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                                                loading="lazy"
                                            />
                                            ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                Empty
                                            </div>
                                            )}
                                        </div>

                                        {/* Title below image */}
                                        <div className="bg-[#ECEEF1] rounded-b-md text-center py-2">
                                            <span className="text-sm font-medium text-gray-800">{c.name}</span>
                                        </div>
                                        </button>
                                    ))}
                                </div>

                            ) : (
                            <div className="flex items-center justify-center bg-[#ECEEF1] w-full h-40 rounded-md">
                                <p className="text-gray-500 text-md">Tap + to create your first Palette.</p>
                            </div>
                            )}
                    </div>

                        {/* footer (fixed) */}
                        <div className = "px-6">
                            <div className="px-6 py-4 border-t">
                                <Animation
                                onCreate = {(paletteName) =>
                                    onCreateDraftCollection(paletteName, id, image.url)
                                }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                )}

            </div>
        )
    }
}

export default Image;