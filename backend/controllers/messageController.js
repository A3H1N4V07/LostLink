const Message = require("../models/Message");
const { getMatchForUser } = require("../services/matchAccess");

const MAX_TEXT = 1000;

//GETTING ALL MESSAGES FOR A MATCH
exports.getMessages = async (req, res) => {
  try {
    const access = await getMatchForUser(req.params.matchId, req.user.id);

    // same answer whether the match does not exist or belongs to someone else
    if (!access || access.match.status !== "confirmed") {
      return res.status(404).json({ msg: "Chat not found" });
    }

    const messages = await Message.find({ matchId: access.match._id })
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.log("GET MESSAGES ERROR:", err.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};


// SENDING MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { matchId, text } = req.body;

    const senderId = req.user.id;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    if (text.length > MAX_TEXT) {
      return res.status(400).json({ msg: `Message is too long (max ${MAX_TEXT} characters)` });
    }

    const access = await getMatchForUser(matchId, senderId);

    if (!access || access.match.status !== "confirmed") {
      return res.status(404).json({ msg: "Chat not found" });
    }

    // the receiver is always the other participant; a receiverId in the body is ignored
    const newMessage = await Message.create({
      matchId: access.match._id,
      senderId,
      receiverId: access.otherUserId,
      text: text.trim()
    });

    // deliver live to everyone in the room (the sender included) from what was actually saved
    const io = req.app.get("io");
    const room = String(access.match._id);
    if (io) io.to(room).emit("receiveMessage", newMessage.toObject());

    // no message text or ids in the log: only how many connected sockets received it
    console.log(`MESSAGE SAVED delivered_to=${io?.sockets.adapter.rooms.get(room)?.size ?? 0} socket(s)`);

    res.status(201).json(newMessage);

  } catch (err) {
    console.log("SEND MESSAGE ERROR:", err.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
