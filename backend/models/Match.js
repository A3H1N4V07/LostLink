const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  lostItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  },
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  },
  score: Number,

  // km between the two items when the match was created
  distance: Number,

  // which signal drove the semantic part of the score: "ai" (embeddings) or "fallback" (word overlap)
  mode: {
    type: String,
    enum: ["ai", "fallback"]
  },

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);