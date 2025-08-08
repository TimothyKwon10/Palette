import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/FireBase/firebase.js';

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
          return snap.exists() ? snap.data().url : null;
        })
      );
    
    return urls.filter(Boolean);
}