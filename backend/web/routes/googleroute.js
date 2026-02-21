const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken")

// Google OAuth login route
router.get("/", passport.authenticate("google", {
    scope: ["profile", "email"] // Request profile and email from Google
}));

// Google OAuth callback route
router.get('/home', passport.authenticate("google", { failureRedirect: '/login' }),
    (req, res) => {
        const secretKey = process.env.JWT_SECRET || "B4t2F13Y";
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username, email: req.user.email },
            secretKey,
            { expiresIn: "1h" }
        );
        res.cookie("jwt", token, { httpOnly: true, maxAge: 1000 * 60 * 60, secure: false, path: "/" });
        // Successful authentication, redirect to the home page or dashboard
        res.redirect('/home'); // Change this to the appropriate landing page after login
    }
);

module.exports = router; // Export the router
