const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const { authreq } = require("../controllers/authcontrol");
const { getCityName } = require("../geolocation"); // Ensure geolocation.js is in backend/web/
const imagesdb = require("../models/imageschema");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { ImageAnnotatorClient } = require('@google-cloud/vision');

// Config from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
        allowedFormats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage: storage });

// Google Vision Config
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, "../../", process.env.GOOGLE_VISION_KEY_PATH || "credentials.json");
const client = new ImageAnnotatorClient();

async function isPlant(imageBuffer) {
    try {
        const [result] = await client.labelDetection({ image: { content: imageBuffer } });
        const labels = result.labelAnnotations;
        return labels.some(label => label.description.toLowerCase().includes('plant'));
    } catch (error) {
        console.error('Vision API Error:', error);
        return false;
    }
}

async function getDiseaseInfo(diseaseName) {
    try {
        const jsonPath = path.join(__dirname, "../../ml/disease_details.json");
        const data = await fs.promises.readFile(jsonPath, "utf-8");
        const diseaseDescriptions = JSON.parse(data);
        return diseaseDescriptions[diseaseName] || {};
    } catch (error) {
        console.error("JSON Read Error:", error);
        return {};
    }
}

router.get("/", authreq, (req, res) => {
    res.render("upload", { filename: null, error: null });
});

router.post("/", authreq, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file uploaded.");

        const imageUrl = req.file.path;
        const username = req.user.name;

        // Fetch image as buffer for APIs
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // 1. Plant Verification
        if (!(await isPlant(imageBuffer))) {
            return res.render("upload", { error: "🚫 Please upload a valid plant/leaf image", filename: imageUrl });
        }

        // 2. Predict via Flask
        const formData = new FormData();
        formData.append("file", imageBuffer, { filename: req.file.filename, contentType: req.file.mimetype });

        const predictionResponse = await axios.post("http://localhost:5000/predict", formData, {
            headers: formData.getHeaders(),
        });

        const { predicted_disease, confidence } = predictionResponse.data;
        const cityname = await getCityName();

        // 3. Save to Database
        await imagesdb.updateOne(
            { username },
            { $push: { imagepath: imageUrl, disease: predicted_disease, confidence: confidence, cityname: cityname } },
            { upsert: true }
        );

        const diseaseInfo = await getDiseaseInfo(predicted_disease);

        res.render("result", {
            image_url: imageUrl,
            predicted_disease,
            confidence,
            ...diseaseInfo
        });

    } catch (error) {
        console.error("Process Error:", error.message);
        res.status(500).send("Error processing image.");
    }
});

module.exports = router;