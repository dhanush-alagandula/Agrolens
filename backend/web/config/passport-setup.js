const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");
const mailusers = require("../models/mailschema");

passport.use(new GoogleStrategy({
    callbackURL: "http://localhost:1000/auth/google/home",
    clientID: keys.clientID,
    clientSecret: keys.clientSecret,
}, async (accessToken, refreshToken, profile, done) => {
    console.log("Access Token:", accessToken); // Log access token
    console.log("Refresh Token:", refreshToken); // Log refresh token
    console.log("Profile:", profile); // Log profile object

    try {
        // Check if the user already exists in the database
        let user = await mailusers.findOne({ googleId: profile.id });
        if (!user) {
            // If user doesn't exist, create a new one
            user = await new mailusers({
                username: profile.displayName,
                googleId: profile.id,
                email: profile.emails[0].value // Capture the email if available
            }).save();
        }

        // Pass the user to the callback
        return done(null, user);
    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Save the user ID in the session
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await mailusers.findById(id); // Find the user by ID in the database
        done(null, user); // Attach the user object to the request
    } catch (err) {
        done(err, null);
    }
});
