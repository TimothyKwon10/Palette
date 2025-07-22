import dotenv from "dotenv";
import axios from 'axios';

const RUNPOD_API_ID = process.env.RUNPOD_POD_ID;

async function waitForModelReady(maxWaitMs = 120000, intervalMs = 3000) {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
        try {
            const response = await axios.get(`https://${RUNPOD_API_ID}-8000.proxy.runpod.net/healthz`)

            if (response.data.ready === true) {
                console.log("RAM++ IS READY TO ROCK AND ROLL");
                return true;
            }
        }
        catch (err) {
            //FreeAPI has not booted up yet and RAM++ is not yet started
        }

        console.log("Waiting for RAM++ to boot up...")
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error("Timed out waiting for RAM++ to boot up");
}

export default waitForModelReady;