const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET || "B4t2F13Y";

const authreq = (req, res, next) => {
  const token = req.cookies.jwt; // Retrieve token from cookies

  if (!token) {
    return res.redirect("/login"); // Redirect if no token is present
  }

  // Verify the JWT token
  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {

      console.error("JWT verification error:", err.message);
      return res.redirect("/login"); // Redirect to login if token is invalid or expired

    }
    // If token is valid, set user information in req.user

    req.user = { id: decodedToken.id, name: decodedToken.username, email: decodedToken.email };
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = { authreq };
