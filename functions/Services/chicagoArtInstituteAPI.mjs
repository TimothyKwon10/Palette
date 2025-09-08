import dotenv from "dotenv";
import functions from "firebase-functions";
import fetch from "node-fetch";
import admin from "./firebaseAdmin.mjs";

export const ChicagoArtInstitutePopulation = functions.https.onRequest(async (req, res) => {
  const secret = req.query.secret;
  const expectedSecret = "Rock-1234";

  if (secret !== expectedSecret) {
    return res.status(403).send("Forbidden: Invalid secret key.");
  }

  const db = admin.firestore();

  const category = req.query.category;
  const limit = Number(req.query.limit) || 50;
  const pages = Number(req.query.pages) || 1;

  if (!category) {
    return res.status(400).send("Missing category parameter");
  }

  const fetchAndStore = async (category, limit, pages) => {
    for (let page = 1; page <= pages; page++) {
      const searchUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
        category
      )}&limit=${limit}&page=${page}`;
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
            
            await db.collection("generalImages")
                .doc(`CAI_${image.id}`)
                .set(
                {
                    id: `CAI_${image.id}`,
                    url: imageUrl,
                    tags: [],
                    colors: [],
                    image_vector: [],
                    hasVector: false,
                    title: image.title || "Untitled",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    category: category,
                    width: image.width || null,
                    height: image.height || null,
                    artist: image.artist_display || "Unknown",
                    date_display: image.date_display || null,
                    classification: image.classification_title || null,
                    style: image.style_title || null,
                    medium: image.medium_display || null,
                    source: "CAI",
                    original_id: image.id,
                    rand: Math.random()
                },
                { merge: true }
                );

            console.log(`Added artwork ID ${artworkId} to Firestore.`);
            } catch (err) {
            console.log("ERROR IN FOR LOOP:", err);
            }
      }
    }
  };

  try {
    await fetchAndStore(category, limit, pages);
    return res.status(200).send(`Artworks for category "${category}" successfully added to Firestore.`);
  } catch (err) {
    console.log("Error accessing Chicago Art Institute API:", err);
    return res.status(500).send("Error accessing Chicago Art Institute API.");
  }
});
