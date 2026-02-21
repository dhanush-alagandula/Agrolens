const express = require('express');
const router = express.Router();
const imagesdb = require("../models/imageschema");
const { authreq } = require("../controllers/authcontrol");

router.get('/', authreq, async (req, res) => {
    const username = req.user.name;
    try {
        const userData = await imagesdb.findOne({ username });
        res.render('profile', {
            user: req.user,
            results: userData ? userData.imagepath.map((path, index) => ({
                imagepath: path,
                disease: userData.disease[index],
                confidence: userData.confidence[index],
                cityname: userData.cityname[index],
            })) : [],
            message: userData ? null : "No recent uploads found."
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;