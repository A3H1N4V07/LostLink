// Frozen copy of the original scoring (title gate, 0.5/0.3/0.2 weights) so the
// evaluation can compare old vs new. Do not use in production code.
const { cosineSimilarity } = require("../services/cosine");

const extractWords = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 2);
};

const titleSimilarity = (t1, t2) => {
  const w1 = extractWords(t1);
  const set = new Set(w1);
  let common = 0;
  for (const w of extractWords(t2)) if (set.has(w)) common++;
  return common / Math.max(w1.length, 1);
};

const legacyScore = (a, b, distanceKm) => {
  const tScore = titleSimilarity(a.title, b.title);
  if (tScore === 0) return { score: 0, mode: "gated", passes: false };

  const hasVec = a.embedding?.length && b.embedding?.length;
  const d1 = extractWords(a.description);
  const d2 = extractWords(b.description);
  const descScore = d1.filter((w) => d2.includes(w)).length / Math.max(d1.length, 1);
  const distanceScore = Math.max(0, 1 - distanceKm / 5);

  const third = hasVec ? cosineSimilarity(a.embedding, b.embedding) : descScore;
  const score = 0.5 * distanceScore + 0.3 * tScore + 0.2 * third;

  return { score, mode: hasVec ? "ai" : "fallback", passes: score > 0.4 };
};

module.exports = { legacyScore };
