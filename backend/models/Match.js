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

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);