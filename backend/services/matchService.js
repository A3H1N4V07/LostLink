const Item = require("../models/Item");
const { scorePair } = require("./scoring");

exports.findMatches = async (newItem) => {
  try {
    const oppositeType = newItem.type === "lost" ? "found" : "lost";

    const nearbyItems = await Item.find({
      type: oppositeType,
      userId: { $ne: newItem.userId },
      location: {
        $near: {
          $geometry: newItem.location,
          $maxDistance: 5000
        }
      }
    }).limit(100);

    const matches = [];

    for (let item of nearbyItems) {
      const distance = calculateDistanceFromCoords(
        newItem.location.coordinates,
        item.location.coordinates
      );

      const result = scorePair(newItem, item, distance);

      if (result.passes) {
        matches.push({
          itemId: item._id,
          score: result.score,
          distance,
          mode: result.mode
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    return matches;

  } catch (err) {
    console.log("MATCH ERROR:", err.message);
    return [];
  }
};

// distance helper
const calculateDistanceFromCoords = (c1, c2) => {
  const [lng1, lat1] = c1;
  const [lng2, lat2] = c2;

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.calculateDistanceFromCoords = calculateDistanceFromCoords;
