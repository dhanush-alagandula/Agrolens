const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const users = require("../models/userschema");

router.get("/email", (req, res) => {
    res.render("forgot_email", { error: "" });
});

router.post("/email", async (req, res) => {
    const { email } = req.body;
    req.session.wantemail = email;
    console.log("Requested email:", req.session.wantemail);

    try {
        const user = await users.findOne({ email });
        console.log("User found:", user);

        if (user) {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            function generateOTP() {
                return crypto.randomInt(1000, 9999).toString();
            }

            const genotp = generateOTP();
            req.session.genotp = genotp;
            console.log("Generated OTP:", genotp);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your Agrolens OTP Code: Secure Your Access",
                text: `Dear User,\n\nYour OTP Code is: ${genotp}\n\nThis code is valid for 5 minutes.`,
                html: `<p>Dear ${user.name},</p><p>Your <strong>OTP Code</strong> is: <span style="font-size: 18px; color: #4CAF50;">${genotp}</span></p>`
            };

            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}: ${genotp}`);

            // Explicitly save session before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.render("forgot_email", { error: "An internal error occurred. Please try again." });
                }
                res.redirect("/forgot/otp");
            });
        } else {
            res.render("forgot_email", { error: "Enter the registered email only!" });
        }
    } catch (err) {
        console.error("Forgot email error:", err);
        res.render("forgot_email", { error: "Email service is temporarily unavailable. Please try again later." });
    }
});

router.get("/otp", (req, res) => {
    res.render("otp");
});

router.post("/otp", (req, res) => {
    const otp = req.body.otp;
    if (!req.session.genotp) {
        return res.render('otp', { error: "Session expired. Please request a new OTP." });
    }
    const tarotp = req.session.genotp.toString();

    if (otp === tarotp) {
        res.redirect('/forgot/changepass');
    } else {
        res.render('otp', { error: "Invalid OTP. Please try again." });
    }
});

router.get("/changepass", (req, res) => {
    res.render("changepass", { error: "" });
});

router.post("/changepass", async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword === confirmPassword) {
        try {
            const updatedUser = await users.findOneAndUpdate(
                { email: req.session.wantemail },
                { $set: { password: newPassword } },
                { new: true }
            );
            if (updatedUser) {
                res.redirect("/login");
            } else {
                res.render("changepass", { error: "User not found." });
            }
        } catch (err) {
            console.error(err);
            res.render("changepass", { error: "Internal server error." });
        }
    } else {
        res.render("changepass", { error: "Passwords do not match." });
    }
});

module.exports = router;