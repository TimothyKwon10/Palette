require("dotenv").config();
const { onCall, HttpsError  } = require("firebase-functions/v2/https");
const fetch = require("node-fetch");
const admin = require("./firebaseAdmin");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const buildPrompt = (categories) => {
    const prompt = `
You are an API that returns JSON only.

The image sources are:
- **DeviantArt:** community-driven art, fan art, illustrations, comics, anime, and stylized digital works.
- **Pexels:** high-quality photography, lifestyle images, and some digital media.
- **ChicagoArtMuseum:** classical fine art, historical paintings, sculptures, and physical artworks from before the internet era. It does NOT include modern pop culture, movies, Kpop, or digital fandom content.

For each of the following categories, generate an image source distribution across DeviantArt, Pexels, and ChicagoArtMuseum based on their actual relevance and specialization. Each category should return percentages that sum exactly to 100.
It is completely okay and oftentimes reasonable to have certain categories with **no distribution** from a source if it's not relevant.

Format your response strictly in this JSON format with no extra text:

{
${categories.map((category, index) => 
  `  "${category}": {\n    "DeviantArt": [number],\n    "Pexels": [number],\n    "ChicagoArtMuseum": [number]\n  }${index < categories.length - 1 ? ',' : ''}`
).join('\n')}
}
    `;

    return prompt;
};

exports.CategoryBucketHandler = onCall(async (request) => {
        console.log("Incoming data object:", request);
        const { categories } = request.data;

        console.log("HEYO CATEGORIES: " + categories);

        if (Array.isArray(categories)) {
            try {
                const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "meta-llama/llama-3.3-70b-instruct",
                        "messages": [{
                            "role": "user",
                            "content": buildPrompt(categories)
                        }]
                    })
                });

                const dataResult = await response.json();
                console.log("Full OpenRouter response:", JSON.stringify(dataResult, null, 2));
                return dataResult;
            }
            catch (error) {
                console.error("Error fetching category buckets:", error);
                throw new HttpsError('internal', 'Error fetching from OpenRouter', error);
            }
        }
        else if (typeof categories === 'string') {
            console.log("WAHTE THE HECK");
        }
        else {
            console.log("im quitting cs");
        }
})