require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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

app.use(express.json());

// 2. Correct CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});