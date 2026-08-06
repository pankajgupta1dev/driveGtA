// drive/downloadDrive.js
const fs = require("fs-extra");
const path = require("path");
const { google } = require("googleapis");
const config = require("./config.json");
const { getDriveAuth } = require("./authorize");

async function downloadNextVideo() {
  const auth = await getDriveAuth();
  const drive = google.drive({ version: "v3", auth });

  const dbPath = path.resolve(__dirname, config.paths.dbFile);
  const db = await fs.readJson(dbPath);

  console.log("🔍 Checking Google Drive folder for videos...");
  const res = await drive.files.list({
    q: `'${config.drive.folderId}' in parents and mimeType contains 'video/' and trashed = false`,
    fields: "files(id, name, mimeType)",
    orderBy: "createdTime asc",
  });

  const files = res.data.files;

  if (!files || files.length === 0) {
    console.log("📂 Drive folder mein koi video nahi mila.");
    return null;
  }

  const pendingFile = files.find((file) => !db.processed_files.includes(file.id));

  if (!pendingFile) {
    console.log("✨ Saari videos already process ho chuki hain!");
    return null;
  }

  console.log(`📥 Downloading video: ${pendingFile.name} (ID: ${pendingFile.id})...`);

  const tempDir = path.resolve(__dirname, config.paths.tempDir);
  await fs.ensureDir(tempDir);

  const localFilePath = path.join(tempDir, pendingFile.name);
  const dest = fs.createWriteStream(localFilePath);

  const downloadRes = await drive.files.get({ fileId: pendingFile.id, alt: "media" }, { responseType: "stream" });

  await new Promise((resolve, reject) => {
    downloadRes.data
      .on("end", () => {
        console.log(`✅ Download complete: ${localFilePath}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ Download failed:", err);
        reject(err);
      })
      .pipe(dest);
  });

  return {
    id: pendingFile.id,
    name: pendingFile.name,
    path: localFilePath,
  };
}

/**
 * Upload successful hone ke baad Drive se file permanent delete karne ke liye
 */
async function deleteDriveFile(fileId) {
  try {
    const auth = await getDriveAuth();
    const drive = google.drive({ version: "v3", auth });

    console.log(`🗑️ Deleting file from Google Drive (ID: ${fileId})...`);
    await drive.files.delete({ fileId: fileId });
    console.log(`✅ File deleted from Google Drive successfully!`);
  } catch (error) {
    console.error(`⚠️ Failed to delete file from Drive: ${error.message}`);
  }
}

module.exports = { downloadNextVideo, deleteDriveFile };
