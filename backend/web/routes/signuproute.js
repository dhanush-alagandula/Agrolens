const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const users = require("../models/userschema");

router.get("/", (req, res) => {
    res.render("signup", { error: null });
});

router.post("/", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existuser = await users.findOne({ email });
        if (existuser) return res.redirect("/login");

        await users.create({ name, email, password });

        // Welcome Email
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Agro Lens",
            html: `<h1>Welcome ${name}!</h1><p>We’re thrilled to have you join Agro Lens.</p>`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Welcome email sent to:", email);
        } catch (mailErr) {
            console.error("Failed to send welcome email:", mailErr.message);
            // We don't return here because we want the user to be signed up regardless
        }

        res.render("login", { error: null });

    } catch (err) {
        console.error("Signup error:", err);
        res.render("signup", { error: "Signup failed" });
    }
});

module.exports = router;