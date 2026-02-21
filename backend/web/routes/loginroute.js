const express = require("express");
const router = express.Router();
const users = require("../models/userschema");
const jwt = require("jsonwebtoken");
const { getCityName } = require("../geolocation");

const maxAge = 1000 * 60 * 60; // 1 hour

router.get("/", (req, res) => {
    res.render("login", { error: null });
});

router.post("/", async (req, res) => {
    const { email, password } = req.body;
    const secretKey = process.env.JWT_SECRET || "B4t2F13Y";

    try {
        const user = await users.findOne({ email });
        if (!user || password !== user.password) {
            return res.render("login", { error: "Invalid email or password" });
        }

        const city = await getCityName();
        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.name, cityname: city },
            secretKey,
            { expiresIn: "1h" }
        );

        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge, secure: false, path: "/" });
        return res.redirect("/home");

    } catch (err) {
        console.error("Login error:", err);
        return res.render("login", { error: "An error occurred, please try again" });
    }
});

module.exports = router;