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
  "https://lost-link-xi.vercel.app" 
];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://lost-link-xi.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

const initSocket = require("./socket/socket");
initSocket(io);

const connectDB = require("./config/db");
connectDB();

app.use(cors());
app.use(express.json());

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