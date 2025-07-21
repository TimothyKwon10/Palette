const startPod = require("./runPodAPI");
const stopPod = require("./stopPodAPI");
const fetchTags = require("./sendImages");
const waitForModelReady = require("./waitForModelReady")
const admin = require("../firebaseAdmin");

const db = admin.firestore();

async function fetchUntaggedImages(limit = 200) {
    const snapshot = await db
    .collection("generalImages")
    .where("tags", "==", []) 
    .limit(limit)
    .get();

    const images = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        images.push({ id: doc.id, source: data.url });
    });
    return images
}

async function sendImages() {
    const images = await fetchUntaggedImages();

    await startPod();
    const ready = await waitForModelReady();
    if (ready) {
        const taggedImages = await fetchTags(images);

        //send the tags back to the db 
        taggedImages.forEach(async ({id, tags}) => {
            await db.collection("generalImages").doc(id).update({
                tags: tags
            })
        })
    }
    else {
        console.log("RAM++ never booted up");
    }

    await stopPod();
}

sendImages();