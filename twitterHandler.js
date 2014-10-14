var twitter = require('twitter');
var sentiment = require('./sentimentHandler');
var Promise = require('bluebird');
var geoAsync = require('./geocoder');

if (process.env.NODE_ENV === 'production') {
  config = process.env.twitRTMConfig;
} else {
  config = require('./twitterKeys');
}

var twitterClient = new twitter(config);

function twitterSearchAsync(search,options) {
  return new Promise(function(resolve,reject){
    twitterClient.search(search,options,function(data){
      console.log("success reached twitter");
      resolve(data.statuses);
    });
  });
}

var getTweets = function(text, options, callback) {
  
  twitterSearchAsync(text, options).map(function(tweet) {
    var resp = {};
    return geoAsync(tweet.geo, tweet.user.location).then(function(data){
      if (data === null || data[0] === undefined){
        resp.geo = false;
      } else if (data[0].length > 2) {
        resp.geo = true
        resp.latitude = data[0][6];
        resp.longitude = data[0][7];
      } else {
        resp.geo = true
        resp.latitude = data[0];
        resp.longitude = data[1];
      }
      resp.screen_name = tweet.user.screen_name;
      resp.text = tweet.text;
      resp.created_at = tweet.created_at;
      resp.sentiment = sentiment(tweet.text).score;
      resp.radius = (Math.abs(resp.sentiment) + 5) * 2;
      if (resp.sentiment > 0) {
        resp.fillKey = "green";
      } else if (resp.sentiment < 0){
        resp.fillKey = "red";
      } else {
        resp.fillKey = "blue";
      }
      return resp;
    });
  })
  .call("filter",function(v,k,c){
    // only return tweets with geo data
    return v.geo;
  })
  .then(function(response){
      console.log("success sentiment, geo");
      callback(response);
  });
};

module.exports = getTweets;