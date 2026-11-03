// Offline evaluation of the matching score on labelled lost/found pairs.
//   node eval/run.js            -> fallback only, plus AI mode if OPENAI_API_KEY is set
//   node eval/run.js --verbose  -> also lists every wrongly classified pair
// Embeddings are cached in eval/.embeddings-cache.json so re-runs cost nothing.
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const { scorePair } = require("../services/scoring");
const { legacyScore } = require("./legacyScore");
const { getEmbedding, EMBEDDING_MODEL } = require("../services/aiService");

const pairs = require("./pairs.json");
const CACHE = path.join(__dirname, ".embeddings-cache.json");
const verbose = process.argv.includes("--verbose");

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

let aiFailed = false; // once OpenAI fails, stop calling it for the rest of the run

const embed = async (title, description) => {
  const text = `${title}. ${description}`.toLowerCase().trim();
  const key = `${EMBEDDING_MODEL}|${text}`; // never reuse vectors from another model
  if (!cache[key]) {
    if (aiFailed) return [];
    const v = await getEmbedding(text);
    if (!v || !v.length) {
      aiFailed = true;
      return [];
    }
    cache[key] = v;
    fs.writeFileSync(CACHE, JSON.stringify(cache));
  }
  return cache[key];
};

const T0 = Date.parse("2026-01-01T00:00:00Z");

const build = async (withEmbeddings) => {
  const out = [];
  for (const p of pairs) {
    const lost = { title: p.lost[0], description: p.lost[1], createdAt: new Date(T0) };
    const found = {
      title: p.found[0],
      description: p.found[1],
      createdAt: new Date(T0 + p.days * 86400000)
    };
    if (withEmbeddings) {
      lost.embedding = await embed(lost.title, lost.description);
      lost.embeddingModel = EMBEDDING_MODEL;
      found.embedding = await embed(found.title, found.description);
      found.embeddingModel = EMBEDDING_MODEL;
    }
    out.push({ p, lost, found });
  }
  return out;
};

const metrics = (rows, decide) => {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  const wrong = [];
  for (const r of rows) {
    const predicted = decide(r);
    if (predicted && r.p.same) tp++;
    else if (predicted && !r.p.same) { fp++; wrong.push(`FALSE MATCH  #${r.p.id} ${r.p.lost[0]} <-> ${r.p.found[0]}`); }
    else if (!predicted && r.p.same) { fn++; wrong.push(`MISSED       #${r.p.id} ${r.p.lost[0]} <-> ${r.p.found[0]}`); }
    else tn++;
  }
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { tp, fp, fn, tn, precision, recall, f1, wrong };
};

const pct = (n) => (n * 100).toFixed(0).padStart(3) + "%";

const report = (label, m) => {
  console.log(
    `${label.padEnd(26)} TP ${String(m.tp).padStart(2)}  FP ${String(m.fp).padStart(2)}  FN ${String(m.fn).padStart(2)}` +
      `   precision ${pct(m.precision)}  recall ${pct(m.recall)}  F1 ${pct(m.f1)}`
  );
  if (verbose) m.wrong.forEach((w) => console.log("      " + w));
};

(async () => {
  const positives = pairs.filter((p) => p.same).length;
  console.log(`${pairs.length} labelled pairs (${positives} same item, ${pairs.length - positives} different)\n`);

  const textRows = await build(false);
  console.log("TEXT ONLY (no OpenAI, the fallback path)");
  report("  old scoring", metrics(textRows, (r) => legacyScore(r.lost, r.found, r.p.km).passes));
  report("  new scoring", metrics(textRows, (r) => scorePair(r.lost, r.found, r.p.km).passes));

  console.log(`\nEmbedding model: ${EMBEDDING_MODEL}`);
  const aiRows = await build(true);
  const missing = aiRows.filter((r) => !r.lost.embedding.length || !r.found.embedding.length).length;
  if (missing) {
    console.log(`\nAI MODE SKIPPED: ${missing} of ${pairs.length} pairs have no embedding (OpenAI call failed).`);
    console.log("Fix the key/credits and re-run; numbers from a partial run would be misleading.");
    return;
  }

  console.log(`\nWITH EMBEDDINGS (${EMBEDDING_MODEL})`);
  report("  old scoring", metrics(aiRows, (r) => legacyScore(r.lost, r.found, r.p.km).passes));
  report("  new scoring", metrics(aiRows, (r) => scorePair(r.lost, r.found, r.p.km).passes));

  console.log("\nTHRESHOLD SWEEP (new scoring, embeddings, content gate kept)");
  for (const t of [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6]) {
    const m = metrics(aiRows, (r) => {
      const s = scorePair(r.lost, r.found, r.p.km);
      return s.score > t && Math.max(s.parts.semantic, s.parts.title) >= 0.25;
    });
    report(`  threshold ${t.toFixed(2)}`, m);
  }
})().catch((e) => {
  console.error("EVAL FAILED:", e);
  process.exit(1);
});
