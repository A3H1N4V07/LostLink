// Re-embed items that have no vector, or one from a different model than the current provider,
// so they can be matched with AI. Safe by default: prints what it WOULD do.
//   node scripts/reembed.js           -> dry run (no database writes, no API calls)
//   node scripts/reembed.js --apply   -> embed and save
// Uses MONGO_URI and the embedding provider settings from backend/.env.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const Item = require("../models/Item");
const { getEmbedding, EMBEDDING_MODEL } = require("../services/aiService");

const apply = process.argv.includes("--apply");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await Item.countDocuments();
  const stale = await Item.find({ embeddingModel: { $ne: EMBEDDING_MODEL } })
    .select("title description type status embeddingModel");

  console.log(`provider model : ${EMBEDDING_MODEL}`);
  console.log(`items          : ${total} total, ${stale.length} need re-embedding`);

  for (const item of stale) {
    console.log(`  - ${item.type.padEnd(5)} ${item.status.padEnd(8)} was "${item.embeddingModel || "none"}"  "${item.title}"`);
  }

  if (!apply) {
    console.log("\nDry run only. Run with --apply to embed and save.");
  } else {
    let done = 0;
    let failed = 0;

    for (const item of stale) {
      const vector = await getEmbedding(`${item.title}. ${item.description || ""}`);

      if (vector && vector.length) {
        // timestamps:false keeps createdAt/updatedAt as they were
        await Item.updateOne(
          { _id: item._id },
          { embedding: vector, embeddingModel: EMBEDDING_MODEL },
          { timestamps: false }
        );
        done++;
      } else {
        failed++;
      }

      await sleep(700); // stay well under the free tier's per-minute limit
    }

    console.log(`\nre-embedded ${done}, failed ${failed}`);
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error("REEMBED FAILED:", e.message);
  process.exit(1);
});
