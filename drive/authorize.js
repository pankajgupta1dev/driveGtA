// drive/authorize.js
const fs = require("fs-extra");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

async function getDriveAuth() {
  const credentials = await fs.readJson(CREDENTIALS_PATH);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (await fs.pathExists(TOKEN_PATH)) {
    const token = await fs.readJson(TOKEN_PATH);
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } else {
    throw new Error("token.json not found in drive folder! Run authorize script first.");
  }
}

// ⚠️ YEH EXPORT ZAROORI HAI:
module.exports = { getDriveAuth };
