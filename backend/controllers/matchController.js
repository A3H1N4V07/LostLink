const Match = require("../models/Match");
const Item = require("../models/Item");
const { getMatchForUser } = require("../services/matchAccess");

// GET USER MATCHES
exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // only this user's matches, found through their own items (not the whole collection)
    const myItemIds = await Item.find({ userId }).distinct("_id");

    const matches = await Match.find({
      $or: [
        { lostItemId: { $in: myItemIds } },
        { foundItemId: { $in: myItemIds } }
      ]
    })
      .populate({ path: "lostItemId", select: "-embedding" })
      .populate({ path: "foundItemId", select: "-embedding" });

    const filtered = matches.filter(m => m.lostItemId && m.foundItemId);

    // privacy logic
    const response = filtered.map(m => {
      const isConfirmed = m.status === "confirmed";

      return {
        matchId: m._id,
        score: m.score,
        distance: m.distance,
        mode: m.mode,
        status: m.status,

        lostItem: isConfirmed
          ? {
              ...m.lostItemId.toObject(),
              user: m.lostItemId.userId
            }
          : {
              title: m.lostItemId.title,
              type: m.lostItemId.type,
              // the photo itself is withheld until the match is confirmed
              hasImage: Boolean(m.lostItemId.image)
            },

        foundItem: isConfirmed
          ? {
              ...m.foundItemId.toObject(),
              user: m.foundItemId.userId
            }
          : {
              title: m.foundItemId.title,
              type: m.foundItemId.type,
              hasImage: Boolean(m.foundItemId.image)
            }
      };
    });

    res.json(response);

  } catch (err) {
    console.log("MATCH ERROR:", err.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// CONFIRM MATCH
exports.confirmMatch = async (req, res) => {
  try {
    const access = await getMatchForUser(req.body.matchId, req.user.id);

    // same answer whether the match does not exist or belongs to someone else
    if (!access) {
      return res.status(404).json({ msg: "Match not found" });
    }

    const { match } = access;

    // only one request can move a match from pending to confirmed
    const updated = await Match.findOneAndUpdate(
      { _id: match._id, status: "pending" },
      { status: "confirmed" }
    );

    if (updated) {
      await Item.updateMany(
        { _id: { $in: [match.lostItemId._id, match.foundItemId._id] } },
        { status: "matched" }
      );
    }

    console.log(`MATCH CONFIRM ${updated ? "confirmed" : "already confirmed"}`);

    res.json({ msg: "Match confirmed + items updated" });

  } catch (err) {
    console.log("CONFIRM ERROR:", err.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
