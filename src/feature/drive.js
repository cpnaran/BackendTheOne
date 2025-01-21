import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = "token.json"; // Store the token in a file
const CREDENTIALS_PATH = "credentials.json"; // Path to your credentials.json file

let oAuth2Client;
let drive;

// Initialize OAuth2 client
export function initializeAuth() {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) {
            console.error("Error loading credentials:", err);
            return;
        }

        authorize(JSON.parse(content));
    });
}

// Authorize and set up the OAuth2 client
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            getNewToken(oAuth2Client);
        } else {
            oAuth2Client.setCredentials(JSON.parse(token));
            drive = google.drive({ version: "v3", auth: oAuth2Client });
            console.log("Authenticated successfully!");
        }
    });
}

// Generate a new token and prompt user for authorization
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });
    console.log("Authorize this app by visiting this URL:", authUrl);
}

// Function to make a file publicly accessible
async function makeFilePublic(fileId) {
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });
}

// Upload a file to Google Drive
export async function uploadFile(filePath) {
    if (!drive) throw new Error("Drive API not initialized");

    const fileMetadata = {
        name: path.basename(filePath),
    };

    const media = {
        mimeType: "image/jpeg", // Adjust MIME type based on your file
        body: fs.createReadStream(filePath),
    };

    try {
        const uploadResponse = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id, name, mimeType, size, createdTime, modifiedTime",
        });

        const fileId = uploadResponse.data.id;
        const fileDetails = uploadResponse.data; // Renamed from 'fileMetadata' to 'fileDetails'
        console.log("🚀 ~ uploadFile ~ fileDetails:", fileDetails);

        await makeFilePublic(fileId);

        const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;

        return {
            message: "File uploaded successfully",
            fileId: fileId,
            publicUrl: publicUrl,
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Error uploading file");
    }
}

// List files from Google Drive
export async function listFiles(pageSize = 10) {
    if (!drive) throw new Error("Drive API not initialized");

    try {
        const response = await drive.files.list({
            pageSize: pageSize,
            fields: "files(id, name)",
        });

        const files = response.data.files;
        if (files.length) {
            return files;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error listing files:", error);
        throw new Error("Error listing files");
    }
}

// Delete a file from Google Drive
export async function deleteFile(fileId) {
    if (!drive) throw new Error("Drive API not initialized");

    try {
        await drive.files.delete({
            fileId: fileId,
        });

        return `File with ID ${fileId} deleted successfully.`;
    } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Error deleting file");
    }
}

// Handle the OAuth2 callback and get a token
export async function handleAuthCallback(code) {
    if (!oAuth2Client) throw new Error("OAuth2 client not initialized");

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        drive = google.drive({ version: "v3", auth: oAuth2Client });

        return "Authentication successful! Token stored.";
    } catch (error) {
        console.error("Error during authentication:", error);
        throw new Error("Error retrieving access token");
    }
}
