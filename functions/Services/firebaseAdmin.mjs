import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Railway / production
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  // Local dev with file
  const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");

  if (!existsSync(keyPath)) {
    throw new Error("Missing Firebase service account credentials at: " + keyPath);
  }

  serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
