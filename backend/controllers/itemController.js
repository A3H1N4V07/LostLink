const Item = require("../models/Item");
const Match = require("../models/Match");
const { findMatches } = require("../services/matchService");
const { getEmbedding, EMBEDDING_MODEL } = require("../services/aiService");

//  normalize text
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().trim();
};

// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    let { title, description, type, location, image } = req.body;

    //  VALIDATION
    if (typeof title !== "string" || !title.trim() || !location) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (type !== "lost" && type !== "found") {
      return res.status(400).json({ msg: "Type must be lost or found" });
    }

    // 0 is a valid coordinate, so check for numbers rather than truthiness
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ msg: "Invalid location" });
    }

    if (title.length > 100 || (description && (typeof description !== "string" || description.length > 1000))) {
      return res.status(400).json({ msg: "Title or description is too long" });
    }

    if (image && (typeof image !== "string" || image.length > 500 || !/^https:\/\//.test(image))) {
      return res.status(400).json({ msg: "Invalid image" });
    }

    title = normalizeText(title);
    description = normalizeText(description || "");

    //  COMBINE TEXT FOR EMBEDDING ONLY
    const combinedText = `${title}. ${description}`;

    // GENERATE EMBEDDING (null = failed, item falls back to word-overlap matching)
    let embedding = [];
    try {
      embedding = (await getEmbedding(combinedText)) || [];
    } catch (err) {
      console.log("Embedding failed:", err.message);
    }
    const aiUsed = embedding.length > 0;

    // CREATE ITEM (WITH GEOJSON)
    const newItem = await Item.create({
      title,
      description,
      type,
      embedding,
      embeddingModel: aiUsed ? EMBEDDING_MODEL : "",
      location: {
        type: "Point",
        coordinates: [
          lng,
          lat
        ]
      },
      image,
      userId: req.user.id
    });

    // MATCHING
    let matches = [];
    try {
      matches = await findMatches(newItem);
    } catch (err) {
      console.log("Matching failed:", err.message);
    }

    for (let m of matches) {
      const existing = await Match.findOne({
        $or: [
          { lostItemId: newItem._id, foundItemId: m.itemId },
          { lostItemId: m.itemId, foundItemId: newItem._id }
        ]
      });

      if (existing) continue;

      await Match.create({
        lostItemId:
          newItem.type === "lost" ? newItem._id : m.itemId,
        foundItemId:
          newItem.type === "found" ? newItem._id : m.itemId,
        score: m.score,
        distance: m.distance,
        mode: m.mode,
        status: "pending"
      });

      console.log(`MATCH CREATED mode=${m.mode} score=${m.score.toFixed(2)} distance=${m.distance.toFixed(1)}km`);
    }

    console.log(
      `ITEM CREATED type=${type} aiUsed=${aiUsed} model=${aiUsed ? EMBEDDING_MODEL : "none"} matches=${matches.length}`
    );

    res.json({
      item: { ...newItem.toObject(), embedding: undefined },
      matchesFound: matches.length,
      aiUsed
    });

  } catch (err) {
    console.log("CREATE ITEM ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET USER ITEMS
exports.getUserItems = async (req, res) => {
  try {
    // the embedding vector is internal to matching; the client never needs it
    const items = await Item.find({ userId: req.user.id })
      .select("-embedding")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.log("GET ITEMS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};