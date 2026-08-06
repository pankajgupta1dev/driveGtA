// setup-env.js
const fs = require("fs-extra");
const path = require("path");

async function setup() {
  console.log("🛠️ Setting up environment files from GitHub Secrets...");

  // 1. Setup drive/credentials.json
  if (process.env.DRIVE_CREDENTIALS_JSON) {
    await fs.ensureDir(path.join(__dirname, "drive"));
    await fs.writeFile(path.join(__dirname, "drive", "credentials.json"), process.env.DRIVE_CREDENTIALS_JSON);
    console.log("✅ Created drive/credentials.json");
  }

  // 2. Setup drive/token.json
  if (process.env.DRIVE_TOKEN_JSON) {
    await fs.writeFile(path.join(__dirname, "drive", "token.json"), process.env.DRIVE_TOKEN_JSON);
    console.log("✅ Created drive/token.json");
  }

  // 3. Setup drive/config.json
  const configContent = {
    drive: {
      folderId: process.env.DRIVE_FOLDER_ID || "",
    },
    facebook: {
      pageId: process.env.FB_PAGE_ID || "",
      accessToken: process.env.FB_PAGE_ACCESS_TOKEN || "",
    },
    paths: {
      dbFile: "../db.json",
      tempDir: "./temp",
    },
  };

  await fs.writeFile(path.join(__dirname, "drive", "config.json"), JSON.stringify(configContent, null, 2));
  console.log("✅ Created drive/config.json");
}

setup().catch(console.error);
