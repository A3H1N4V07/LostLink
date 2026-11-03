const axios = require("axios");

// EMBEDDING_PROVIDER = local (default, free, runs in this process) | gemini (free key) | openai (paid)
const PROVIDER = (process.env.EMBEDDING_PROVIDER || "local").toLowerCase();
const MAX_ATTEMPTS = 3;

const MODELS = {
  local: "Xenova/all-MiniLM-L6-v2",
  gemini: "gemini-embedding-001",
  openai: "text-embedding-3-small"
};

// normalize text
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().trim();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A 429 with insufficient_quota is a billing problem, not a rate limit: retrying cannot help.
const isRetryable = (err) => {
  const apiError = err.response?.data?.error;
  if (apiError?.type === "insufficient_quota" || apiError?.code === "insufficient_quota") return false;
  const status = err.response?.status;
  return !status || status === 429 || status >= 500;
};

// ---- providers: each takes clean text and returns number[] (throws on failure) ----

// Loaded once on first use (downloads ~25 MB the first time, then cached on disk).
let localExtractor = null;
const getLocalExtractor = () => {
  if (!localExtractor) {
    localExtractor = import("@huggingface/transformers")
      .then(({ pipeline }) => pipeline("feature-extraction", MODELS.local, { dtype: "q8" }))
      .catch((err) => {
        localExtractor = null; // allow a later retry
        throw err;
      });
  }
  return localExtractor;
};

const localEmbed = async (text) => {
  const extractor = await getLocalExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

const geminiEmbed = async (text) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:embedContent`,
    {
      content: { parts: [{ text }] },
      taskType: "SEMANTIC_SIMILARITY",
      outputDimensionality: 768
    },
    {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" },
      timeout: 8000
    }
  );
  return res.data.embedding.values;
};

const openaiEmbed = async (text) => {
  const res = await axios.post(
    "https://api.openai.com/v1/embeddings",
    { model: MODELS.openai, input: text },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 8000
    }
  );
  return res.data.data[0].embedding;
};

const PROVIDERS = {
  local: { embed: localEmbed, ready: () => true },
  gemini: { embed: geminiEmbed, ready: () => Boolean(process.env.GEMINI_API_KEY) },
  openai: { embed: openaiEmbed, ready: () => Boolean(process.env.OPENAI_API_KEY) }
};

// "provider:model", stored on each item so vectors from different models are never compared
exports.EMBEDDING_MODEL = `${PROVIDER}:${MODELS[PROVIDER] || "unknown"}`;
exports.EMBEDDING_PROVIDER = PROVIDER;

exports.getEmbedding = async (text) => {
  const cleanText = normalizeText(text);

  if (!cleanText) return [];

  const provider = PROVIDERS[PROVIDER];

  if (!provider) {
    console.log(`EMBEDDING SKIPPED: unknown EMBEDDING_PROVIDER "${PROVIDER}" (fallback matching will be used)`);
    return null;
  }

  if (!provider.ready()) {
    console.log(`EMBEDDING SKIPPED: ${PROVIDER} provider has no API key set (fallback matching will be used)`);
    return null;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await provider.embed(cleanText);

    } catch (err) {
      console.log(
        `EMBEDDING ERROR [${PROVIDER}] (attempt ${attempt}/${MAX_ATTEMPTS}):`,
        err.response?.data || err.message
      );

      if (attempt === MAX_ATTEMPTS || !isRetryable(err)) return null;

      await sleep(500 * 2 ** (attempt - 1));
    }
  }

  return null;
};
