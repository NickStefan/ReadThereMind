var twitter = require('twitter');
var config = require('./twitterKeys');
 
var getTweets = function(text, callback) {
  var twitterClient = new twitter(config);
  var response = [];
 
  twitterClient.search(text, function(data) {
    for (var i = 0; i < data.statuses.length; i++) {
      var resp = {};
      resp.tweet = data.statuses[i];
      response.push(resp);
    };
    callback(response);
  });
}

module.exports = getTweets;