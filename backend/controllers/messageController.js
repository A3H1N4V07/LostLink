const Message = require("../models/Message");

//GETTING ALL MESSAGES FOR A MATCH
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;

    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// SENDING MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { matchId, receiverId, text } = req.body;

    const senderId = req.user.id;

    if (!matchId || !receiverId || !text) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const newMessage = new Message({
      matchId,
      senderId,
      receiverId,
      text
    });

    await newMessage.save();

    res.status(201).json(newMessage);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};