import admin from "../firebaseAdmin.mjs";

const db = admin.firestore();

async function getImage(id) {
    const doc = await db.collection("generalImages").doc(id).get();
    if (doc.exists) {
    console.log(doc.data());
    }
}

getImage(process.argv[2]);