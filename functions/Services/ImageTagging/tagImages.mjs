import startPod from "./runPodAPI.mjs";
import stopPod from "./stopPodAPI.mjs";
import fetchTags from "./sendImages.mjs";
import waitForModelReady from "./waitForModelReady.mjs";
import admin from "../firebaseAdmin.mjs";

const db = admin.firestore();

async function fetchUntaggedImages(limit = 200) {
    const snapshot = await db
    .collection("generalImages")
    .where("image_vector", "==", [])
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
        const imageData = await fetchTags(images);
        const imageTagsRAMPP = imageData.ram_results;
        const imageVectorsCLIP = imageData.clip_results;
        const imageColors = imageData.palette_results

        //send the tags back to the db 
        for (const tagObj of imageTagsRAMPP) {
            const vectorObj = imageVectorsCLIP.find(v => v.id === tagObj.id);
            const colorObj = imageColors.find(v => v.id === tagObj.id)

            await db.collection("generalImages").doc(tagObj.id).update({
                tags: tagObj.tags,
                image_vector: vectorObj.image_vector,
                colors: colorObj.palette
            });
        }
    }
    else {
        console.log("Stopping pod as there are no GPUs available at this time or the model crashed");
    }

    await stopPod();
}

fetchUntaggedImages()
    .then(async (images) => {
        if (images.length === 0) {
            console.log("No untagged / unvectorized images found. Exiting.");
            process.exit(0);
        }

        await tagImages(images);
        process.exit(0);
    })
    .catch((err) => {
        console.error("Tagging failed:", err);
        process.exit(1);
    });