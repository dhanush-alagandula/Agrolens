// logoutroute.js
const express = require("express");
const router = express.Router();

// Logout route
router.get("/", (req, res) => {
    if(req.cookies.jwt){
        res.cookie("jwt","",{maxAge:1});
        res.clearCookie("jwt"); // Clear JWT cookie
    return res.redirect("/home");
    }
    
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destroy error:", err);
            }
            res.redirect("/login"); // Redirect to login or home page after logout
        });
        // Redirect to login page after logout
    });
});

module.exports = router;
