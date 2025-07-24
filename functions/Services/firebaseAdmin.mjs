import admin from "firebase-admin";
import { createRequire } from "module";
import fs from "fs";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Railway / production
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else if (fs.existsSync("./serviceAccountKey.json")) {
  // Local dev with file
  const require = createRequire(import.meta.url);
  serviceAccount = require("../serviceAccountKey.json");
} else {
  throw new Error("Missing Firebase service account credentials");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
