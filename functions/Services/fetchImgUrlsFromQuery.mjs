import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/FireBase/firebaseConfig.js';

export async function fetchImgUrlsFromQuery(query) {
    const response = await fetch("https://vectorsearch-production-d8b5.up.railway.app/vectorizeAndCompare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query })
    });

    const data = await response.json();
    const matches = data.matches;

    const urls = await Promise.all(
        matches.map(async (match) => {
          const snap = await getDoc(doc(db, "generalImages", match.id));
          if (!snap.exists()) return null;

          const url = snap.get("url");
          if (!url) return null;

          const width = snap.get("width");
          const height = snap.get("height");

          return { id: match.id, url, width, height };
        })
      );
    
    return urls.filter(Boolean);
}