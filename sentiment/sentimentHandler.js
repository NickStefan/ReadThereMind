var sentiment = require('sentiment');

var sentimentHandler = function(text) {
  return sentiment(text);
};
module.exports = sentimentHandler;