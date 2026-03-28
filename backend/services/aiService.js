const axios = require("axios");

// normalize text
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().trim();
};

exports.getEmbedding = async (text) => {
  try {
    const cleanText = normalizeText(text);

    if (!cleanText) return [];

    const res = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        model: "text-embedding-3-small",
        input: cleanText
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.data[0].embedding;

  } catch (err) {
    console.log(
      "OPENAI EMBEDDING ERROR:",
      err.response?.data || err.message
    );

    return null;
  }
};