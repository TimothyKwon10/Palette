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

async function tagImages() {
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

async function loopTagImages(intervalMinutes = 30) {
    while (true) {
        try {
          const images = await fetchUntaggedImages();
          if (images.length > 0) {
            //images require tagging 
            await tagImages();
          } 
          else {
            //all images are tagged already
            console.log("No untagged images");
          }
    
          //wait for next increment in 30 minutes to start tagger 
          await new Promise(resolve => setTimeout(resolve, intervalMinutes * 60 * 1000));
        } 
        catch (err) {
          console.error("Error in loop:", err);
        }
    }
}

loopTagImages();