exports.getDistanceScore = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;

  const dx = loc1.lat - loc2.lat;
  const dy = loc1.lng - loc2.lng;

  const distance = Math.sqrt(dx * dx + dy * dy);

  return Math.max(0, 1 - distance); 
};