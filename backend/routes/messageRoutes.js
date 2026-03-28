const express = require("express");
const router = express.Router();

const {
  getMessages,
  sendMessage
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/:matchId", authMiddleware, getMessages);

router.post("/send", authMiddleware, sendMessage);

module.exports = router;