require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

const server = http.createServer(app);


const allowedOrigins = [
  "http://localhost:5173", 
  "https://lost-link-xi.vercel.app", 
  process.env.FRONTEND_URL 
].filter(Boolean); 

// 1. Correct CORS for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// small bodies only: no endpoint needs more, and large ones are an easy way to waste memory
app.use(express.json({ limit: "100kb" }));

const limiter = (windowMinutes, max) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: "Too many requests, please try again later" }
  });

app.use(limiter(15, 600));                       // everything
app.use("/api/auth", limiter(15, 30));           // login / signup: slows password guessing
app.post("/api/items", limiter(15, 20));         // each upload costs an embedding + a matching pass
app.post("/api/messages/send", limiter(1, 60));

// 2. Correct CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

app.set("io", io); // REST handlers push saved messages to the chat rooms

const initSocket = require("./socket/socket");
initSocket(io);

const connectDB = require("./config/db");
connectDB();

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

// unknown routes and unexpected errors: JSON, never a stack trace
app.use((req, res) => res.status(404).json({ msg: "Not found" }));

app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") return res.status(413).json({ msg: "Request too large" });
  if (err.type === "entity.parse.failed") return res.status(400).json({ msg: "Invalid JSON" });
  console.log("UNHANDLED ERROR:", err.message);
  res.status(500).json({ msg: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});