import dotenv from "dotenv";
import functions from "firebase-functions";
import fetch from "node-fetch";
import admin from "./firebaseAdmin.mjs";

export const PexelsDBPopulation = functions.https.onRequest(async (req, res) => {
    const secret = req.query.secret;
    const expectedSecret = "Rock-1234";
  
    if (secret !== expectedSecret) { //making sure I don't populate my database multiple times on accident
      return res.status(403).send("Forbidden: Invalid secret key.");
    }

    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    const db = admin.firestore();
    const categoryFieldsPrimary = [
    "photography", "studio photography", "editorial photography",
    "street photography", "lifestyle photography", "macro photography", "portrait photography", "headshot", "studio portrait",
    "natural light portrait", "profile portrait", "black and white portrait", "landscape", "mountains", "forest", "beach", "desert",
    "waterfall", "night sky", "sunset", "architecture", "cityscape", "skyscraper", "interior design",
    "minimal architecture", "brutalist", "staircase", "facade", "fashion", "street style", "lookbook", "runway", "fashion editorial",
    "fashion portrait", "model studio", "food photography", "cuisine", "plating", "chef cooking",
    "baking", "restaurant kitchen", "close up food", "Animals & Pets", "Plants & Flowers", "Beauty & Cosmetics"
    ];

    const fetchAndStore = async (category, limit) => { //fetches the api key and the stores the necessary images into the images collection
        const response = await fetch(`https://api.pexels.com/v1/search?query=${category}&per_page=${limit}`, {
            method: "GET",
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });

        const data = await response.json();
        const photos = data.photos;

        for (const photo of photos) {
            await db.collection("generalImages").doc(`pexels_${photo.id}`).set ({ //fields for each image_item in the db
                id: `pexels_${photo.id}`,
                url: photo.src.large2x,
                tags: [],
                colors: [],
                hasVector: false,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                image_vector: [],
                category: category,
                artist: photo.photographer,
                photographer_url: photo.photographer_url,
                width: photo.width,
                height: photo.height,
                rand: Math.random(),
                source: "pexels",
                original_id: photo.id
            },
            { merge: true });
        }
    };

    try {
        for (const category of categoryFieldsPrimary) { //fetches 25 images for primary category fields
            await fetchAndStore(category, "80");
        }

        res.status(200).send("Images successfully added to Firestore.");
    }
    catch (error) {
        console.error("Error populating Firestore:", error);
        res.status(500).send("An error occurred while adding images.");
    }
});