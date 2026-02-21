const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 1000;

// Path Config
const FRONTEND_PATH = path.join(__dirname, "../../frontend");

// Middleware
app.use(express.static(path.join(FRONTEND_PATH, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// Middleware (continued)
const passport = require("passport");
require("./config/passport-setup"); // Passport config

app.use(session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(FRONTEND_PATH, "views"));

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/agrolens")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Database connection error:", err));

// Routes
const loginRoute = require("./routes/loginroute");
const signupRoute = require("./routes/signuproute");
const homeRoute = require("./routes/homeroute");
const uploadRoute = require("./routes/uploadroute");
const profileRoute = require("./routes/profileroute");
const googleRoute = require("./routes/googleroute");
const forgotRoute = require("./routes/forgotroute");
const logoutRoute = require("./routes/logoutroute");

app.use("/", homeRoute); // Home page at root
app.use("/home", homeRoute);
app.use("/login", loginRoute);
app.use("/signup", signupRoute);
app.use("/upload", uploadRoute);
app.use("/profile", profileRoute);
app.use("/auth/google", googleRoute);
app.use("/forgot", forgotRoute);
app.use("/logout", logoutRoute);

// Plant Care Data Route
const plantCareData = require("./routes/plantcare");
app.get("/json/plantcare.json", (req, res) => {
    res.json(plantCareData);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});