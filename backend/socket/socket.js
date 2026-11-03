const { verifyToken } = require("../middleware/authMiddleware");
const { getMatchForUser } = require("../services/matchAccess");

const initSocket = (io) => {
  // 1. Every connection must carry a valid JWT; the user id comes from the token, never from the client
  io.use((socket, next) => {
    try {
      const decoded = verifyToken(socket.handshake.auth?.token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 2. A user can only join the room of a confirmed match they belong to
    socket.on("joinRoom", async (matchId) => {
      try {
        const access = await getMatchForUser(matchId, socket.userId);

        if (!access || access.match.status !== "confirmed") {
          console.log("SOCKET JOIN REFUSED (not a participant or match not confirmed)");
          return;
        }

        const room = String(access.match._id);
        socket.join(room);
        console.log(`SOCKET JOINED room_size=${io.sockets.adapter.rooms.get(room)?.size ?? 0}`);
      } catch (err) {
        console.log("joinRoom error:", err.message);
      }
    });

    // Messages are delivered by the REST endpoint after they are saved, so there is
    // deliberately no client-driven "sendMessage" event: it could be spoofed or never saved.

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initSocket;
