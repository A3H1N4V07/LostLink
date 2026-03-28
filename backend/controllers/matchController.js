const Match = require("../models/Match");

// GET USER MATCHES
exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find()
      .populate("lostItemId")
      .populate("foundItemId");

    const filtered = matches.filter(m => {
      if (!m.lostItemId || !m.foundItemId) return false;

      return (
        m.lostItemId.userId.toString() === userId ||
        m.foundItemId.userId.toString() === userId
      );
    });

    // privacy logic
   const response = filtered.map(m => {
  const isConfirmed = m.status === "confirmed";

  return {
    matchId: m._id,
    score: m.score,
    status: m.status,

    lostItem: isConfirmed
      ? {
          ...m.lostItemId.toObject(),
          user: m.lostItemId.userId
        }
      : {
          title: m.lostItemId.title,
          type: m.lostItemId.type,
          image: m.lostItemId.image
        },

    foundItem: isConfirmed
      ? {
          ...m.foundItemId.toObject(),
          user: m.foundItemId.userId
        }
      : {
          title: m.foundItemId.title,
          type: m.foundItemId.type,
          image: m.foundItemId.image
        }
  };
});

    res.json(response);

  } catch (err) {
    console.log("MATCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// CONFIRM MATCH
exports.confirmMatch = async (req, res) => {
  try {
    const { matchId } = req.body;

    const match = await Match.findById(matchId)
      .populate("lostItemId")
      .populate("foundItemId");

    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    // Updating match status
    match.status = "confirmed";
    await match.save();

    const Item = require("../models/Item");

    await Item.findByIdAndUpdate(match.lostItemId._id, {
      status: "matched"
    });

    await Item.findByIdAndUpdate(match.foundItemId._id, {
      status: "matched"
    });

    res.json({ msg: "Match confirmed + items updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};