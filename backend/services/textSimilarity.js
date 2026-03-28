exports.getTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = text1.toLowerCase().split(" ");
  const words2 = text2.toLowerCase().split(" ");

  const common = words1.filter(word => words2.includes(word));

  return common.length / Math.max(words1.length, words2.length);
};