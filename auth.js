const { google } = require("googleapis");
const fs = require("fs-extra");
const path = require("path");

const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

async function checkChannels() {
  const credentials = await fs.readJson(CREDENTIALS_PATH);

  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = await fs.readJson(TOKEN_PATH);
  auth.setCredentials(token);

  const youtube = google.youtube({
    version: "v3",
    auth,
  });

  const response = await youtube.channels.list({
    part: ["id", "snippet"],
    mine: true,
  });

  console.log("\n========== YOUR CHANNEL ==========\n");

  if (!response.data.items || response.data.items.length === 0) {
    console.log("No channel found.");
    return;
  }

  response.data.items.forEach((channel, index) => {
    console.log(`Channel ${index + 1}`);
    console.log("------------------------------");
    console.log("ID    :", channel.id);
    console.log("Title :", channel.snippet.title);
    console.log();
  });
}

checkChannels().catch(console.error);
