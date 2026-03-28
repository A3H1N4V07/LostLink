const Item = require("../models/Item");
const { cosineSimilarity } = require("./cosine");

// extract words
const extractWords = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 2);
};

// title similarity
const titleSimilarity = (t1, t2) => {
  const w1 = extractWords(t1);
  const w2 = extractWords(t2);

  const set = new Set(w1);

  let common = 0;
  for (let w of w2) {
    if (set.has(w)) common++;
  }

  return common / Math.max(w1.length, 1);
};

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
    });

    const matches = [];

    for (let item of nearbyItems) {

      // distance
      const distance = calculateDistanceFromCoords(
        newItem.location.coordinates,
        item.location.coordinates
      );

      // title similarity
      const tScore = titleSimilarity(newItem.title, item.title);
      if (tScore === 0) continue;

      // embedding similarity (AI)
      let embeddingScore = null;

      if (newItem.embedding?.length && item.embedding?.length) {
        embeddingScore = cosineSimilarity(
          newItem.embedding,
          item.embedding
        );
      }

      // description fallback similarity
      const descWords1 = extractWords(newItem.description);
      const descWords2 = extractWords(item.description);

      const commonDesc = descWords1.filter(w => descWords2.includes(w)).length;
      const descScore = commonDesc / Math.max(descWords1.length, 1);

      // distance score
      const distanceScore = Math.max(0, 1 - distance / 5);

      // FINAL HYBRID SCORE
      let finalScore;

      if (embeddingScore !== null) {
        // AI MODE
        finalScore =
          0.5 * distanceScore +
          0.3 * tScore +
          0.2 * embeddingScore;
      } else {
        // FALLBACK MODE
        finalScore =
          0.5 * distanceScore +
          0.3 * tScore +
          0.2 * descScore;
      }

      if (finalScore > 0.4) {
        matches.push({
          itemId: item._id,
          score: finalScore,
          distance
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