import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import Header from "../Header.jsx";
import { useState } from "react";
import Add from '../../assets/images/add.png';
import Cross from '../../assets/images/cross.png';

function Finalize() {
    const db = getFirestore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
  
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput("");
    };

    const removeTag = (idx) => {
    setTags(prev => prev.filter((_, i) => i !== idx));
    };

    const addToDB = async (e) => {
        e.preventDefault();

        try {await addDoc(collection(db, "generalImages"), {
            url: sessionStorage.getItem("uploadPreviewURL"),
            uploadedAt: serverTimestamp(),
            source: "User",
            title: title || "",
            artist: "N/A",
            tags: tags || [],
            description: description || "",
            image_vector: []
        })
            console.log("Successfully added to DB");
        }
        catch (err) {
            console.log("error", err)
        }

        sessionStorage.removeItem("uploadPreviewURL");
    }

    return (
        <div className="px-6">
            <Header />
            <div className="mb-6" />

            <div className="w-full flex justify-center">
                <div className="flex w-full max-w-6xl gap-8 flex-col md:flex-row md:items-start">
                    <div className="w-full md:w-1/2 flex md:justify-end">
                        <div className="w-full max-w-[560px] bg-gray-100 rounded-2xl
                                        flex items-center justify-center p-2">
                            <img
                            src={sessionStorage.getItem("uploadPreviewURL")}
                            alt="Upload Preview"
                            className="w-auto max-w-full h-auto object-contain rounded-2xl"
                            />
                        </div>
                    </div>

                    {/* Right: Form (50% on md+, full width on mobile) */}
                    <form onSubmit = {addToDB} className="w-full md:w-1/2 flex flex-col gap-5">
                        <input
                        type="text"
                        placeholder="Title (Optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#019cb9]"
                        />

                        <textarea
                        placeholder="Description (Optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#019cb9] min-h-[150px] overflow-y-auto resize-none"
                        onInput={(e) => {
                            e.target.style.height = "auto"; 
                            e.target.style.height = `${e.target.scrollHeight}px`; // expand to fit content
                        }}
                        />

                        <div className="w-full">

                            {/* chips above the input */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((t, i) => (
                                    <span
                                    key={`${t}-${i}`}
                                    className="inline-flex items-center gap-x-1.5 rounded-full bg-gray-100 px-2 py-1 text-sm"
                                    >
                                    {t}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(i)}
                                        className = "hover:bg-gray-300 rounded-full transition duration-100 ease-in-out"
                                        aria-label={`Remove ${t}`}
                                    >
                                        <img src = {Cross} className =  "h-5 w-5"/>
                                    </button>
                                    </span>
                                ))}
                                </div>
                            )}

                            <div className="flex">
                                <input
                                type="text"
                                placeholder="Add tags (Optional)"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === ",") {
                                    e.preventDefault();
                                    addTag();
                                    }
                                }}
                                className="flex-1 border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#019cb9]"
                                />
                                <button
                                type="button"
                                onClick={addTag}
                                className="ml-2 px-4 rounded-md bg-[#019cb9] text-white hover:bg-[#018aa5] transition"
                                aria-label="Add tag"
                                >
                                    <img src = {Add} className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>

                        <button
                        type="submit"
                        className="w-full bg-[#019cb9] text-white py-2 px-4 rounded-md hover:bg-[#018aa5] transition-colors duration-200"
                        >
                        Publish
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Finalize;
