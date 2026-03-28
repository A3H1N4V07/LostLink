const Match = require("../models/Match");

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join Room
    socket.on("joinRoom", (matchId) => {
      socket.join(matchId);
      console.log("Joined room:", matchId);
    });

    // Send Message (ONLY BROADCAST)
    socket.on("sendMessage", async (data) => {
      try {
        const { matchId } = data;

        //  Check match status
        const match = await Match.findById(matchId);

        if (!match || match.status !== "confirmed") {
          console.log("Chat blocked: match not confirmed");
          return;
        }

        // Broadcast message
        io.to(matchId).emit("receiveMessage", data);

      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initSocket;