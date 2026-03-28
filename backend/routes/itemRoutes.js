const express = require("express");
const router = express.Router();

const { createItem, getUserItems } = require("../controllers/itemController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createItem);
router.get("/", authMiddleware, getUserItems);

module.exports = router;