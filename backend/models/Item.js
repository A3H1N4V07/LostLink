const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  // AI embedding vector
  embedding: {
    type: [Number],
    default: []
  },

  // GEOJSON LOCATION (VERY IMPORTANT)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },

  // Single image field
  image: {
    type: String,
    default: ""
  },

  type: {
    type: String,
    enum: ["lost", "found"],
    required: true
  },

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });


itemSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Item", itemSchema);