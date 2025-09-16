
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env' });

try {
    if (!admin.apps.length) {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!serviceAccountKey) {
            throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The application cannot start without it.");
        }

        // A raw JSON file will start with '{'. A Base64 string from a JSON file will usually start with 'ew=='.
        if (serviceAccountKey.trim().startsWith('{')) {
            throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY appears to be raw JSON. It must be Base64-encoded. Please encode your service account JSON file to a Base64 string.");
        }
        
        let serviceAccount;
        try {
            // Decode the Base64 string into a JSON string
            const decodedServiceAccount = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
            // Parse the JSON string into an object
            serviceAccount = JSON.parse(decodedServiceAccount);
        } catch (e: any) {
            // This catch block will handle both Base64 decoding errors and JSON parsing errors.
            console.error("Failed to decode or parse the FIREBASE_SERVICE_ACCOUNT_KEY.", e);
            throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY is not a valid Base64-encoded JSON string. Please double-check the value in your .env file.");
        }
        
        // This is the crucial fix: Ensure the private_key is correctly formatted.
        // Environment variables can sometimes escape or remove newline characters.
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        // Directly use the parsed and corrected service account object.
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log("Firebase Admin SDK initialized successfully.");
    }
} catch (error: any) {
    console.error("CRITICAL: Firebase Admin SDK Initialization failed.", error);
    // Throw a more descriptive error to make it clear what's happening and stop the application from proceeding with a broken connection.
    throw new Error(`Firebase Admin SDK Initialization Error: ${error.message}`);
}

const db = admin.firestore();
const auth = admin.auth();
const initializedAdmin = admin;

export { initializedAdmin as admin, db, auth };
