// model/tokenBlacklist.js
const blacklistedTokens = new Set();

exports.addToken = (token) => {
  blacklistedTokens.add(token);
};

exports.isBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

exports.clear = () => {
  blacklistedTokens.clear();
};