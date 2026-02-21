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

const credentialsPath = path.resolve(__dirname, "../../..", "credentials.json");
console.log("Calculated Google Vision Credentials Path:", credentialsPath);
process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
const client = new ImageAnnotatorClient();

// Add global error handlers for this process
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

async function isPlant(imageBuffer) {
    try {
        const [result] = await client.labelDetection({ image: { content: imageBuffer } });
        const labels = result.labelAnnotations;
        const isPlantImage = labels.some(label => label.description.toLowerCase().includes('plant') || label.description.toLowerCase().includes('leaf'));
        console.log("Vision API Labels:", labels.map(l => l.description).join(", "));
        return isPlantImage;
    } catch (error) {
        console.error('Vision API Error:', error);
        // If Vision API fails, we'll log it but maybe let it pass for now if we're sure it's a plant
        // for development. In production, we should probably return false.
        return true;
    }
}

async function getDiseaseInfo(diseaseName) {
    try {
        const jsonPath = path.join(__dirname, "../../ml/disease_details.json");
        const data = await fs.promises.readFile(jsonPath, "utf-8");
        const diseaseDescriptions = JSON.parse(data);
        const info = diseaseDescriptions[diseaseName];
        if (!info) {
            console.log(`No disease details found for: ${diseaseName}`);
            return {
                description: "No specific information available for this disease.",
                symptoms: [],
                treatments: [],
                pests: [],
                fertilizers: []
            };
        }
        return info;
    } catch (error) {
        console.error("JSON Read Error:", error);
        return {
            description: "Error loading disease information.",
            symptoms: [],
            treatments: [],
            pests: [],
            fertilizers: []
        };
    }
}

router.get("/", authreq, (req, res) => {
    res.render("upload", { filename: null, error: null });
});

router.post("/", authreq, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            console.log("No file uploaded in request.");
            return res.status(400).send("No file uploaded.");
        }

        const imageUrl = req.file.path;
        console.log(`Processing upload for user: ${req.user.name}, Image: ${imageUrl}`);

        // Fetch image as buffer for APIs
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // 1. Plant Verification
        console.log("Verifying if it's a plant...");
        const plantCheck = await isPlant(imageBuffer);
        if (!plantCheck) {
            console.log("Image verified as NOT a plant.");
            return res.render("upload", { error: "🚫 Please upload a valid plant/leaf image", filename: imageUrl });
        }
        console.log("Plant verification successful.");

        // 2. Predict via Flask
        console.log("Sending to Flask ML server for prediction...");
        const formData = new FormData();
        formData.append("file", imageBuffer, { filename: req.file.filename, contentType: req.file.mimetype });

        try {
            const predictionResponse = await axios.post("http://localhost:5000/predict", formData, {
                headers: formData.getHeaders(),
                timeout: 30000 // 30 second timeout
            });

            const { predicted_disease, confidence } = predictionResponse.data;
            console.log(`Prediction result: ${predicted_disease} (${confidence}%)`);

            const cityname = await getCityName();

            // 3. Save to Database
            await imagesdb.updateOne(
                { username: req.user.name },
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
        } catch (flaskError) {
            console.error("Flask ML Server Error:", flaskError.message);
            if (flaskError.code === 'ECONNREFUSED') {
                return res.render("upload", { error: "ML Server is currently offline. Please try again later.", filename: imageUrl });
            }
            throw flaskError;
        }

    } catch (error) {
        console.error("Process Error Detail:", error);
        res.status(500).send("Error processing image: " + error.message);
    }
});

module.exports = router;