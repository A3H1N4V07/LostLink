const { cosineSimilarity } = require("./cosine");

// Tunable in one place. Weights sum to 1.
const WEIGHTS = { semantic: 0.45, title: 0.25, distance: 0.15, time: 0.15 };
// Embedding scores are spread differently from word-overlap scores, so each mode has its own bar.
const THRESHOLDS = { ai: 0.5, fallback: 0.4 };
const MIN_CONTENT = 0.25; // distance + time alone must never create a match
const MAX_KM = 5;
const TIME_HALF_LIFE_DAYS = 7;

// Cosine similarity of short texts only uses part of [-1, 1], and where depends on the model.
// Each profile stretches the model's realistic range to 0-1 before weighting. Measured on
// eval/pairs.json (same item >= 0.61, different item mostly <= 0.52 for MiniLM). Models with no
// profile use DEFAULT_PROFILE and should be calibrated with 'npm run eval:matching' before trust.
const PROFILES = {
  "local:Xenova/all-MiniLM-L6-v2": { floor: 0.35, ceil: 0.85, threshold: 0.5 },
  "openai:text-embedding-3-small": { floor: 0.2, ceil: 0.8 },
  // Gemini scores run high: different items 0.72-0.89, same item 0.87-0.99 on eval/pairs.json
  "gemini:gemini-embedding-001": { floor: 0.75, ceil: 1.0, threshold: 0.55 }
};
const DEFAULT_PROFILE = { floor: 0.3, ceil: 0.85 };

const STOPWORDS = new Set([
  "the", "and", "with", "near", "has", "have", "was", "for", "from", "that",
  "this", "some", "found", "lost", "left", "inside", "very", "its"
]);

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
};

// symmetric overlap: |A ∩ B| / |A ∪ B|
const jaccard = (a, b) => {
  const setA = new Set(a);
  const setB = new Set(b);
  if (!setA.size || !setB.size) return 0;

  let common = 0;
  for (const w of setA) if (setB.has(w)) common++;

  return common / (setA.size + setB.size - common);
};

const hasVector = (item) => Array.isArray(item.embedding) && item.embedding.length > 0;

/**
 * Score one lost/found pair.
 * a, b: { title, description, embedding?, createdAt? }
 * distanceKm: great-circle distance between them
 * Returns { score, mode, passes, parts } — mode says which signal drove "semantic".
 */
const scorePair = (a, b, distanceKm) => {
  const titleScore = jaccard(tokenize(a.title), tokenize(b.title));

  let semantic;
  let mode;
  let threshold = THRESHOLDS.fallback;

  // vectors from different models (or sizes) are not comparable, so they fall back to words
  const sameModel = (a.embeddingModel || "") === (b.embeddingModel || "");

  if (hasVector(a) && hasVector(b) && sameModel && a.embedding.length === b.embedding.length) {
    mode = "ai";
    const profile = PROFILES[a.embeddingModel] || DEFAULT_PROFILE;
    const { floor, ceil } = profile;
    threshold = profile.threshold ?? THRESHOLDS.ai;
    semantic = clamp01((cosineSimilarity(a.embedding, b.embedding) - floor) / (ceil - floor));
  } else {
    mode = "fallback";
    semantic = jaccard(
      tokenize(`${a.title} ${a.description}`),
      tokenize(`${b.title} ${b.description}`)
    );
  }

  const distanceScore = clamp01(1 - distanceKm / MAX_KM);

  let timeScore = 1;
  if (a.createdAt && b.createdAt) {
    const days = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 86400000;
    timeScore = Math.pow(0.5, days / TIME_HALF_LIFE_DAYS);
  }

  const score =
    WEIGHTS.semantic * semantic +
    WEIGHTS.title * titleScore +
    WEIGHTS.distance * distanceScore +
    WEIGHTS.time * timeScore;

  const passes = Math.max(semantic, titleScore) >= MIN_CONTENT && score > threshold;

  return {
    score,
    mode,
    passes,
    parts: { semantic, title: titleScore, distance: distanceScore, time: timeScore }
  };
};

module.exports = { scorePair, tokenize, jaccard, WEIGHTS, THRESHOLDS };
