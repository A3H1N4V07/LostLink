const jwt = require("jsonwebtoken");

// Returns the decoded payload, or throws. Shared by HTTP routes and the socket handshake.
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No token" });
  }

  try {
    // Extract token from "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    req.user = verifyToken(token);

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports.verifyToken = verifyToken;
