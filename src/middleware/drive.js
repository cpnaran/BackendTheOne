import fs, { access } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Set up Google Drive API
const SCOPES = process.env.SCOPE;
// const TOKEN_PATH = {
//   access_token: process.env.ACCESS_TOKEN,
//   refresh_token: process.env.REFRESH_TOKEN,
//   scope: process.env.SCOPE,
//   token_type: process.env.TOKEN_TYPE,
//   expiry_date: process.env.EXPIRY_DATE,
// };
const TOKEN_PATH = "token.json";

const CREDENTIALS_PATH = {
  web: {
    client_id: process.env.CLIENT_ID,
    project_id: process.env.PROJECT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: process.env.REDIRECT_URIS,
  },
};

let oAuth2Client;
let drive;

// Initialize OAuth2 client
export function initializeAuth() {
  authorize(CREDENTIALS_PATH);
}

// Authorize and set up the OAuth2 client
// Authorize and set up the OAuth2 client
function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris);
  console.log("🚀 ~ authorize ~ redirect_uris:", redirect_uris);
  console.log("🚀 ~ authorize ~ client_secret:", client_secret);
  console.log("🚀 ~ authorize ~ client_id:", client_id);

  fs.readFile(TOKEN_PATH, (err, token) => {
    console.log("🚀 ~ fs.readFile ~ token:", token);
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
