require("dotenv").config();
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const admin = require("./firebaseAdmin");

exports.ChicagoArtInstitutePopulation = functions.https.onRequest(async (req, res) => {
    const secret = req.query.secret;
    const expectedSecret = "Rock-1234";

    if (secret !== expectedSecret) {
        return res.status(403).send("Forbidden: Invalid secret key.");
    }

    const db = admin.firestore();
    const categories = ["impressionism", "cubism", "baroque", "renaissance", 
        "portrait", "landscape", "still life", "religious", 
        "oil painting", "watercolor", "sculpture", "textile"
    ];

    const fetchAndStore = async (category, limit) => {
        const searchUrl = `https://api.artic.edu/api/v1/artworks/search?q=${category}&limit=${limit}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            console.log(`Failed search fetch for category ${category}:`, response.status, response.statusText);
            return;
        }

        const allData = await response.json();
        const searchResults = allData.data;

        if (!searchResults || searchResults.length === 0) {
            console.log(`No search results for category ${category}`);
            return;
        }

        for (const result of searchResults) {
            try {
                const artworkId = result.id;
                const artworkUrl = `https://api.artic.edu/api/v1/artworks/${artworkId}`;
                const artworkRes = await fetch(artworkUrl);

                if (!artworkRes.ok) {
                    console.log(`Failed artwork fetch for ID ${artworkId}:`, artworkRes.status, artworkRes.statusText);
                    continue;
                }

                const artworkData = await artworkRes.json();
                const image = artworkData.data;
                const iiifBaseUrl = artworkData.config?.iiif_url;

                if (!image || !image.image_id || !iiifBaseUrl) {
                    console.log(`Missing image data for artwork ID ${artworkId}`);
                    continue;
                }

                const imageUrl = `${iiifBaseUrl}/${image.image_id}/full/843,/0/default.jpg`;

                // Check for duplicate based on original_id
                const duplicateQuery = await db.collection("generalImages")
                    .where("original_id", "==", image.id)
                    .get();

                if (!duplicateQuery.empty) {
                    console.log(`Artwork ID ${artworkId} already exists in Firestore. Skipping.`);
                    continue;
                }

                await db.collection("generalImages").add({
                    url: imageUrl,
                    title: image.title || "Untitled",
                    category: category,
                    artist: image.artist_display || "Unknown",
                    date_display: image.date_display || null,
                    classification: image.classification_title || null,
                    style: image.style_title || null,
                    medium: image.medium_display || null,
                    source: "CAI",
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    original_id: image.id
                });

                console.log(`Added artwork ID ${artworkId} to Firestore.`);

            } catch (err) {
                console.log("ERROR IN FOR LOOP:", err);
            }
        }
    };

    try {
        for (const category of categories) {
            await fetchAndStore(category, 5);
        }
        return res.status(200).send("Artworks successfully added to Firestore.");
    } catch (err) {
        console.log("Error accessing Chicago Art Institute API:", err);
        return res.status(500).send("Error accessing Chicago Art Institute API.");
    }
});
