import startPod from "./runPodAPI.mjs";
import stopPod from "./stopPodAPI.mjs";
import fetchTags from "./sendImages.mjs";
import waitForModelReady from "./waitForModelReady.mjs";
import admin from "../firebaseAdmin.mjs";

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

async function tagImages(images) {
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

fetchUntaggedImages()
    .then(async (images) => {
        console.log("image length: " + images.length + " " + JSON.stringify(images, null, 2))
        if (images.length === 0) {
            console.log("No untagged images found. Exiting.");
            process.exit(0);
        }

        await tagImages(images);
        process.exit(0);
    })
    .catch((err) => {
        console.error("Tagging failed:", err);
        process.exit(1);
    });