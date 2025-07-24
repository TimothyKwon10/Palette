import dotenv from "dotenv";
dotenv.config();
import { request, gql } from "graphql-request";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_POD_ID = process.env.RUNPOD_POD_ID;
const ENDPOINT = "https://api.runpod.io/graphql";

const headers = {
  Authorization: `Bearer ${RUNPOD_API_KEY}`,
};

const variables = {
  podId: RUNPOD_POD_ID,
};

const checkGpuAvailability = async () => {
  const query = gql`
    query Pod($podId: String!) {
      pod(podId: $podId) {
        id
        name
        runtime {
          gpus {
            id
            gpuUtilPercent
            memoryUtilPercent 
          }
        }
      }
    }
  `;

  try {
    const data = await request(ENDPOINT, query, variables, headers);
    const pod = data.pod;
    if (!pod) {
      throw new Error("Pod not found");
    }

    return pod.runtime.gpus.length > 0
  } 
  catch (err) {
    console.error("Failed to fetch pod info:", err);
    return false;
  }
};

const resumePod = async () => {
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
      return true;

  } 
  catch (err) {
    console.error("Failed to start pod:", err);
    return false;
  }
};

const startPod = async () => {
  const available = await checkGpuAvailability();
  if (!available) {
    console.log("No GPUs available — skipping pod start.");
    return false;
  }

  return await resumePod();
};

export default startPod;
