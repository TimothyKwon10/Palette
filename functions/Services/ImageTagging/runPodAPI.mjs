import dotenv from "dotenv";
dotenv.config();
import { request, gql } from "graphql-request";
import waitForModelReady from "./waitForModelReady.mjs";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_POD_ID = process.env.RUNPOD_POD_ID;
const ENDPOINT = "https://api.runpod.io/graphql";

const headers = {
  Authorization: `Bearer ${RUNPOD_API_KEY}`,
};

const variables = {
  podId: RUNPOD_POD_ID,
};

const startPod = async () => {
  const query = gql`
    mutation ResumePod($podId: String!) {
      podResume(input: { podId: $podId }) {
        id
        desiredStatus
      }
    }
  `;

  try {
    const data = await request(ENDPOINT, query, variables, headers);
      console.log("Pod resume request sent:", data);

  } 
  catch (err) {
    console.error("Failed to start pod:", err);
  }
};

export default startPod;
