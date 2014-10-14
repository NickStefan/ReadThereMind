var twitter = require('twitter');
var config = require('./twitterKeys');
var sentiment = require('./sentimentHandler');
var geocoder = require('./geocoder');
 
var getTweets = function(text, options, callback) {
  var twitterClient = new twitter(config);
  var response = [];
  console.log(geocoder(text));
  twitterClient.search(text, options, function(data) {
    for (var i = 0; i < data.statuses.length; i++) {
      var resp = {};
      resp = data.statuses[i];
      resp.sentiment = sentiment(data.statuses[i].text).score;
      if (!resp.geo) {
        // console.log(goecoder(data.statuses[i].text));
        // var lat = 40;
        // var lng = -120;
        // resp.geo = {};
        // resp.type = 'Point';
        // resp.geo.coordinates = [];
        // resp.geo.coordinates.push(lat,lng);
      }
      // resp.text = data.statuses[i].text;
      // resp.geo = data.statuses[i].geo;
      // resp.location = data.statuses[i].user.location;
      // resp.created_at = data.statuses[i].created_at;
      // resp.user = data.statuses[i].user;
      response.push(resp);
    };
    callback(response);
  });
}

module.exports = getTweets;