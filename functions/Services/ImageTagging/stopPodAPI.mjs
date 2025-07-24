import dotenv from "dotenv";
dotenv.config();
import { request, gql } from "graphql-request";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_POD_ID = process.env.RUNPOD_POD_ID;
const ENDPOINT = "https://api.runpod.io/graphql";

const headers = {
  Authorization: `Bearer ${RUNPOD_API_KEY}`,
};

const stopPod = async () => {
  const query = gql`
    mutation podStop($podId: String!) {
      podStop(input: { podId: $podId }) {
        id
        desiredStatus
      }
    }
  `;

  const variables = {
    podId: RUNPOD_POD_ID,
  };

  try {
    const data = await request(ENDPOINT, query, variables, headers);
    console.log("Pod stop request sent:", data);
  } catch (err) {
    console.error("Failed to stop pod:", err);
  }
};

export default stopPod;
