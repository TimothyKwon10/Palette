import dotenv from "dotenv";
import functions from "firebase-functions";
import fetch from "node-fetch";
import admin from "./firebaseAdmin.mjs";

export const DeviantArtPopulation = functions.https.onRequest(async (req, res) => {
    const secret = req.query.secret;
    const expectedSecret = "Rock-1234";
  
    if (secret !== expectedSecret) { //making sure I don't populate my database multiple times on accident
      return res.status(403).send("Forbidden: Invalid secret key.");
    }

    const db = admin.firestore();
    const CLIENT_ID = process.env.DEVIANTART_CLIENT_ID;
    const CLIENT_SECRET = process.env.DEVIANTART_CLIENT_SECRET;
    const categories = ["digitalart", "illustration", "conceptart", "digitalpainting", "studioghibli", "sketch", "anime"];

    async function getDeviantArtToken() {
        const response = await fetch(`https://www.deviantart.com/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        })

        const data = await response.json();
        return data.access_token;
    }

    async function getDeviantArtTags(token, deviationID) { //retrieving image tags for maturity filtering purposes 
        const response = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/metadata?deviationids=${deviationID}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await response.json();
        if (!data.metadata || !Array.isArray(data.metadata) || data.metadata.length === 0) {
            return [];
        }
    
        const tagsArray = data.metadata[0].tags || [];
        const tagNames = tagsArray.map(tag => tag.tag_name?.toLowerCase()).filter(Boolean);
    
        return tagNames; // returns an array of lowercase tags for a specific deviation
    }

    const riskyTags = [ //filtering based off of tags 
        "nsfw", "explicit", "nude", "nudes", "nudity", "porn", "hentai", 
        "ecchi", "bdsm", "bondage", "lewd", "sex", "erotica", 
        "adult", "sensual", "uncensored", "sexy", "pinup", 
        "lingerie", "bikini", "underwear", "provocative", "risqué", 
        "boudoir", "fetish", "latex", "stockings", "thighs", 
        "cleavage", "sideboob", "backless", "butt", "booty", 
        "girl", "waifu", "woman", "cosplay", "anime", "furry"
    ];

    try { //retrieving images from deviantArt and filtering for mature content 
        const token = await getDeviantArtToken();
        const fetchAndStore = async (category, limit) => {
            const response = await fetch(`https://www.deviantart.com/api/v1/oauth2/browse/tags?tag=${category}&limit=${limit}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await response.json();
            const images = data.results;

            for (const image of images) {
                try {
                    const imageUrl = image.content?.src || image.thumbs?.[0]?.src;
                    if (!imageUrl) continue;
                    if (image.is_mature) continue;

                    const tags = await getDeviantArtTags(token, image.deviationid);
                    const tagHit = riskyTags.some(tag => tags.includes(tag));
                    if (tagHit) continue;

                    await db.collection("generalImages").add({
                        id: `deviantart_${image.deviationid}`,
                        url: imageUrl,
                        tags: [],
                        image_vector: [],
                        title: image.title || "",
                        category: category, 
                        artist: image.author?.username || "Unknown",
                        artist_icon: image.author?.usericon || null,
                        width: image.content?.width || null,
                        height: image.content?.height || null,
                        source: "deviantart",
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        original_id: image.deviationid
                    });
                }
                catch (err) {
                    console.error("ERROR IN FOR LOOP: ", err);
                }
            }
        };

        for (const category of categories) {
            await fetchAndStore(category, 25);
        }

        return res.status(200).send("Success!");
    }
    catch (err) {
        console.error("Error fetching DeviantArt data:", err);
        return res.status(500).send("Error fetching DeviantArt data");
    };
});