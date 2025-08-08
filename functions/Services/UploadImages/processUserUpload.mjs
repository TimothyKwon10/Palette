import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const storage = getStorage();
const db = getFirestore();
const auth = getAuth();

async function uploadAndStore(file) {
    if (!file) {
        throw new Error("No file or file corrupted");
    }
    
    const storageRef = ref(storage, `uploads/${file.name}`);
    await uploadBytes(storageRef, file);

    const URL = await getDownloadURL(storageRef);
    await addDoc(collection(db, "generalImages"), {
        url: URL,
        uploadedAt: serverTimestamp(),
        source: "User",
        title: "N/A",
        artist: "N/A",
        tags: [],
        image_vector: []
    })

}

export default uploadAndStore;