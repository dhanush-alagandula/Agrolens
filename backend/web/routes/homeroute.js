const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
    const token = req.cookies.jwt;
    const secretKey = process.env.JWT_SECRET || "B4t2F13Y";
    let decodedToken = null;

    if (token) {
        try {
            decodedToken = jwt.verify(token, secretKey);
        } catch (error) {
            console.error("Verification error:", error);
        }
    }

    res.render("homepage", {
        token: decodedToken,
        user: decodedToken ? { id: decodedToken.id, username: decodedToken.username } : null,
    });
});

module.exports = router;