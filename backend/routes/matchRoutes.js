const express = require("express");
const router = express.Router();

const { getMatches, confirmMatch } = require("../controllers/matchController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all matches (with privacy)
router.get("/", authMiddleware, getMatches);

// Confirm a match
router.post("/confirm", authMiddleware, confirmMatch);

module.exports = router;