import dotenv from "dotenv";
import functions from "firebase-functions";
import fetch from "node-fetch";
import admin from "./firebaseAdmin.mjs";

exports.PexelsDBPopulation = functions.https.onRequest(async (req, res) => {
    const secret = req.query.secret;
    const expectedSecret = "Rock-1234";
  
    if (secret !== expectedSecret) { //making sure I don't populate my database multiple times on accident
      return res.status(403).send("Forbidden: Invalid secret key.");
    }

    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    const db = admin.firestore();
    const categoryFieldsPrimary = ["nature", "poses", "portraiture"];
    const categoryFieldsSecondary = ["fashion", "graphic design", "cyberpunk", "candid photography", "retro", "home decor", "food"];

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
            await db.collection("generalImages").add({ //fields for each image_item in the db
                id: `pexels_${photo.id}`,
                url: photo.src.large,
                tags: [],
                category: category,
                photographer: photo.photographer,
                photographer_url: photo.photographer_url,
                width: photo.width,
                height: photo.height,
                source: "pexels",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                original_id: photo.id
            });
        }
    };

    try {
        for (const category of categoryFieldsPrimary) { //fetches 25 images for primary category fields
            await fetchAndStore(category, "25");
        }

        for (const category of categoryFieldsSecondary) { //fetches 15 images for secondary category fields
            await fetchAndStore(category, "15");
        }

        res.status(200).send("Images successfully added to Firestore.");
    }
    catch (error) {
        console.error("Error populating Firestore:", error);
        res.status(500).send("An error occurred while adding images.");
    }
});