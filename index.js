// index.js
const fs = require("fs-extra");
const path = require("path");
const config = require("./drive/config.json");
const { downloadNextVideo, deleteDriveFile } = require("./drive/downloadDrive");
const { uploadToFacebook } = require("./uploadFacebook");

async function startFacebookOnlyWorkflow() {
  try {
    console.log("==========================================");
    console.log("🚀 Running Drive -> Facebook Auto Uploader");
    console.log("==========================================");

    // 1. Download Next Video from Drive
    const videoFile = await downloadNextVideo();

    if (!videoFile) {
      console.log("☕ No pending videos to upload. Exiting...");
      return;
    }

    // 2. Upload to Facebook
    console.log(`\n📤 Uploading file [${videoFile.name}] to Facebook...`);
    const fbVideoId = await uploadToFacebook(videoFile.path, `Auto Upload: ${videoFile.name}`);

    // 3. Cleanup Local Temp File
    console.log(`\n🧹 Removing local temp file: ${videoFile.path}`);
    await fs.remove(videoFile.path);

    // 4. Delete File from Google Drive (Cloud Cleanup)
    console.log(`\n🗑️ Cleaning up Google Drive storage...`);
    await deleteDriveFile(videoFile.id);

    // 5. Update db.json
    console.log(`\n📝 Updating db.json tracking...`);
    const dbPath = path.resolve(__dirname, config.paths.dbFile);
    const db = await fs.readJson(dbPath);

    db.processed_files.push(videoFile.id);
    db.last_processed_file = videoFile.name;
    db.last_updated = new Date().toISOString();

    await fs.writeJson(dbPath, db, { spaces: 2 });

    console.log("==========================================");
    console.log("🎉 SUCCESS: Uploaded & Auto-deleted from Drive!");
    console.log("==========================================");
  } catch (error) {
    console.error("💥 Workflow failed:", error.message);
  }
}

startFacebookOnlyWorkflow();
