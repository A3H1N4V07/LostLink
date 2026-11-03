const mongoose = require("mongoose");

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
      return;
    } catch (err) {
      console.log(`MongoDB connection failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, err.message);

      if (attempt === MAX_ATTEMPTS) {
        // give up so the host restarts us, instead of serving requests with no database
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
