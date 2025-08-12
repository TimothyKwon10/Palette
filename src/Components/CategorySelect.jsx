import CategoryCards from "./CategoryCards";
import { useState } from "react";
import { auth, db } from '../FireBase/firebase';
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from "firebase/functions";

import Add from '../assets/images/add.png';
import Cross from '../assets/images/cross.png';
import DigitalArtImg from '../assets/images/categories/Digital_Art.jpg';
import PhotographyImg from '../assets/images/categories/Photography.jpg';
import IllustrationImg from '../assets/images/categories/Illustration.jpg';
import Art3DImg from '../assets/images/categories/3D_Art.jpg';
import ConceptArtImg from '../assets/images/categories/Concept_Art.jpg';
import CharacterDesignImg from '../assets/images/categories/Character_Design.jpg';
import LandscapeImg from '../assets/images/categories/Landscape.jpg';
import PortraitureImg from '../assets/images/categories/Portraiture.jpeg';
import CookingImg from '../assets/images/categories/Cooking.jpg';
import ArchitectureImg from '../assets/images/categories/Architecture.jpg';
import AnimeImg from '../assets/images/categories/Anime.jpg';
import FashionImg from '../assets/images/categories/Fashion.jpg';
import AbstractImg from '../assets/images/categories/Abstract.jpeg';
import TraditionalPaintingImg from '../assets/images/categories/Traditional_Painting.jpg';
import GraphicDesignImg from '../assets/images/categories/Graphic_Design.jpg';

function CategorySelect() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const nav = useNavigate();

    const handleCategoryClick = (categoryName) => {
        // check if it's already selected
        if (selectedCategories.includes(categoryName)) {
            // remove it
            setSelectedCategories(selectedCategories.filter(item => item !== categoryName));
        } else {
            // add it
            setSelectedCategories([...selectedCategories, categoryName]);
        }
    }

    const [addedCategories, setAddedCategories] = useState([]);
    const [searchInput, setSearchInput] = useState("");

    //handle adding new categories 
    const handleCategoryAddition = (e) => {
        e.preventDefault();
        const trimmedInput = searchInput.trim();

        if (trimmedInput !== "" && !addedCategories.includes(trimmedInput)) {
            setAddedCategories([...addedCategories, trimmedInput]);
            setSelectedCategories([...selectedCategories, trimmedInput])
            setSearchInput("");
            console.log(trimmedInput + " added!")
        }
    }

    //handle removing new categories
    const handleCategoryRemoval = (categoryName) => {
        setAddedCategories(addedCategories.filter(item => item !== categoryName));
        setSelectedCategories(selectedCategories.filter(item => item !== categoryName));
    }

    //After selecting interested categories, handle pressing the done button
    const handleDone = async () => {
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { firstTime: false,
                preferences: arrayUnion(...selectedCategories)
             });
    
            const functions = getFunctions();
            const categoryBucket = httpsCallable(functions, 'CategoryBucketHandler');

            console.log("Sending:", { categories: selectedCategories });
            const result = await categoryBucket({ categories: selectedCategories });
            
            console.log("Result:", result);
            console.log('Server response:', result.data);

            nav("/");
        }
        catch (err) {
            console.error('Error handling Done:', err);
            alert('Something went wrong while generating category buckets.');
        }
    }

    //list of predetermined categories new users can choose from
    const categories = ["Digital Art", "Photography", "Illustration", "3D Art", "Concept Art", 
                        "Character Design", "Landscape", "Portraiture", "Cooking", "Architecture",
                        "Anime", "Fashion", "Abstract", "Traditional Painting", "Graphic Design"
    ]

    const imageMapping = {
        "Digital Art" : DigitalArtImg,
        "Photography" : PhotographyImg,
        "Illustration" : IllustrationImg,
        "3D Art" : Art3DImg,
        "Concept Art" : ConceptArtImg,
        "Character Design" : CharacterDesignImg,
        "Landscape" : LandscapeImg,
        "Portraiture" : PortraitureImg,
        "Cooking" : CookingImg,
        "Architecture" : ArchitectureImg,
        "Anime" : AnimeImg,
        "Fashion" : FashionImg,
        "Abstract" : AbstractImg,
        "Traditional Painting" : TraditionalPaintingImg,
        "Graphic Design" : GraphicDesignImg
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-[Lato-Regular]">
            <div className="bg-white pb-8 pr-8 pl-8 rounded shadow-lg w-5/6 overflow-y-auto max-h-[75vh]">
                <div className = "flex flex-col gap-3 items-center md:flex-row md:items-center md:justify-between sticky top-0 z-50 bg-white pt-6 pb-2 mb-2 -mx-8">
                    <div className = "pl-8">
                        <h1 className="text-4xl font-[PlayfairDisplay] mb-2">Welcome to Palette</h1>
                        <h3 className = "text-xl mb-5">Select 5 categories to get started: </h3>
                    </div>
                    <div className = "pr-8">
                        {selectedCategories.length < 5 ? <p className = "py-2 px-4 rounded bg-zinc-200 cursor-default">Pick {5 - selectedCategories.length} more</p> 
                        : <button onClick = {() => handleDone()} className = "py-2 px-4 rounded bg-[#019cb9] text-white font-black hover:bg-[#017d96] transition">Done!</button>}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 mb-[24px] md:grid-cols-3 gap-6"> {/* cards go here */}
                    {categories.map(categoryName => (
                        <CategoryCards 
                            key = {categoryName}
                            categoryName = {categoryName}
                            onClick = {() => handleCategoryClick(categoryName)}
                            isSelected = {selectedCategories.includes(categoryName)}
                            imgSource = {imageMapping[categoryName]}
                        />
                    ))}
                </div>
                <div className = "flex flex-wrap gap-x-3">
                   {/* added bubble categories go here */}
                   {addedCategories.map(category =>
                        (<div key = {category} className = "mb-3 px-2 py-1 flex gap-x-1.5 items-center rounded-full bg-gray-100">
                            <span>{category}</span>
                            <button onClick = {() => handleCategoryRemoval(category)} className = "hover:bg-gray-300 rounded-full transition duration-100 ease-in-out">
                                <img src = {Cross} className = "h-5 w-5"/>
                            </button>
                        </div>
                    ))}
                </div>

                {/* form to add ones own categories */}
                <form className = "flex gap-3" onSubmit = {handleCategoryAddition}>
                    <input type = "text" placeholder = "Don't see your interest? Add it here..."
                    className = "placeholder:text-gray-500 w-full px-3 py-2 basis-[93%] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fa5902]"
                    value={searchInput}
                    onChange = {(e) => setSearchInput(e.target.value)}
                    />
                    <button type = "submit" className = "basis-[7%] bg-[#fa5902] flex items-center justify-center rounded hover:bg-[#d94e02] transition">
                        <img src = {Add} className="h-5 w-5"/>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CategorySelect;