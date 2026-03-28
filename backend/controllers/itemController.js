const Item = require("../models/Item");
const Match = require("../models/Match");
const { findMatches } = require("../services/matchService");
const { getEmbedding } = require("../services/aiService");

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
    if (!title || !location || !location.lat || !location.lng) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    title = normalizeText(title);
    description = normalizeText(description || "");

    //  COMBINE TEXT FOR EMBEDDING ONLY
    const combinedText = `${title}. ${description}`;

    // GENERATE EMBEDDING (Gemini / AI)
    let embedding = [];
    try {
      embedding = await getEmbedding(combinedText);
    } catch (err) {
      console.log("Embedding failed:", err.message);
    }

    // CREATE ITEM (WITH GEOJSON)
    const newItem = await Item.create({
      title,
      description,
      type,
      embedding, 
      location: {
        type: "Point",
        coordinates: [
          parseFloat(location.lng), 
          parseFloat(location.lat) 
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
        status: "pending"
      });
    }

    res.json({
      item: newItem,
      matchesFound: matches.length
    });

  } catch (err) {
    console.log("CREATE ITEM ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET USER ITEMS
exports.getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.log("GET ITEMS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};