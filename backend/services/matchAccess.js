const mongoose = require("mongoose");
const Match = require("../models/Match");

/**
 * Load a match only if `userId` is one of its two participants.
 * Returns { match, otherUserId } or null (invalid id, no such match, or not a participant).
 * Callers must answer null with the same response for "missing" and "forbidden",
 * so match ids cannot be probed.
 */
exports.getMatchForUser = async (matchId, userId) => {
  if (!mongoose.isValidObjectId(matchId) || !userId) return null;

  const match = await Match.findById(matchId)
    .populate({ path: "lostItemId", select: "-embedding" })
    .populate({ path: "foundItemId", select: "-embedding" });

  if (!match || !match.lostItemId || !match.foundItemId) return null;

  const lostOwner = String(match.lostItemId.userId);
  const foundOwner = String(match.foundItemId.userId);
  const me = String(userId);

  if (me !== lostOwner && me !== foundOwner) return null;

  return { match, otherUserId: me === lostOwner ? foundOwner : lostOwner };
};
