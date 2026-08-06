// facebook/uploadFacebook.js
const fs = require("fs-extra");
const axios = require("axios");
const FormData = require("form-data");
const config = require("./drive/config.json");

/**
 * Uploads a video file to Facebook Page
 * @param {string} videoPath - Local temp path of video
 * @param {string} videoTitle - Title/Description for Facebook
 */
async function uploadToFacebook(videoPath, videoTitle = "New Short Clip 🎬") {
  try {
    const { pageId, pageAccessToken } = config.facebook;

    if (!pageId || !pageAccessToken) {
      throw new Error("Facebook Page ID or Access Token is missing in config.json");
    }

    console.log(`🚀 Starting Facebook Video Upload...`);

    const formData = new FormData();
    formData.append("access_token", pageAccessToken);
    formData.append("description", videoTitle);
    formData.append("source", fs.createReadStream(videoPath));

    // Graph API Video Endpoint
    const url = `https://graph.facebook.com/v19.0/${pageId}/videos`;

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.data && response.data.id) {
      console.log(`✅ Uploaded to Facebook successfully! Video ID: ${response.data.id}`);
      return response.data.id;
    } else {
      throw new Error("Facebook API did not return a valid video ID.");
    }
  } catch (error) {
    const errorDetails = error.response ? error.response.data : error.message;
    console.error("❌ Facebook Upload Error:", JSON.stringify(errorDetails, null, 2));
    throw error;
  }
}

module.exports = { uploadToFacebook };
