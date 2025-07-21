require("dotenv").config();
const axios = require('axios');

const RUNPOD_API_ID = process.env.RUNPOD_POD_ID;

async function fetchTags(images) {
    try {
        const response = await axios.post(`https://${RUNPOD_API_ID}-8000.proxy.runpod.net/`, 
            images,
            {
                headers : {
                    "Content-Type": "application/json"
                },
            });

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    }
    catch (error) {
        console.log("Tagging API error:", error.response?.data || error.message);
    }
}

module.exports = fetchTags;