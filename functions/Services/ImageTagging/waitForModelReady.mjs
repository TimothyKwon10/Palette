import dotenv from "dotenv";
dotenv.config();
import axios from 'axios';

const RUNPOD_API_ID = process.env.RUNPOD_POD_ID;

async function waitForModelReady(maxWaitMs = 120000, intervalMs = 3000) {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
        try {
            const response = await axios.get(`https://${RUNPOD_API_ID}-8000.proxy.runpod.net/healthz`)

            if (response.data.ready === true) {
                console.log("RAM++ AND CLIP ARE READY TO ROCK AND ROLL");
                return true;
            }
        }
        catch (err) {
            //FreeAPI has not booted up yet and RAM++ is not yet started
        }

        console.log("Waiting for RAM++ and CLIP to ready up...")
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    console.log("Timed out waiting for RAM++ and CLIP to boot up");
    return false
}

export default waitForModelReady;