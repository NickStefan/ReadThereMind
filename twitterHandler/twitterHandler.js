var twitter = require('twitter');
var sentiment = require('../sentiment/sentimentHandler');
var Promise = require('bluebird');
var geoAsync = require('../geo/geocoder');

if (process.env.NODE_ENV === 'production') {
  config = process.env.twitRTMConfig;
} else {
  config = require('./twitterKeys');
}

var twitterClient = new twitter(config);

function twitterSearchAsync(search,options) {
  return new Promise(function(resolve,reject){
    twitterClient.search(search,options,function(data){
      console.log("success ", data.statuses.length, " tweets");
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
        resp.geo = true;
        resp.latitude = data[0][6];
        resp.longitude = data[0][7];
      } else {
        resp.geo = true;
        resp.latitude = data[0];
        resp.longitude = data[1];
      }
      resp.screen_name = tweet.user.screen_name;
      resp.text = tweet.text;
      resp.id = tweet.id;
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
  .then(function(response){
      console.log("success ", response.length, " sentiments");
      callback(response);
  });
};

function getTweetsAsync(text,options){
  return new Promise(function(resolve,reject){
    getTweets(text,options,function(data){
      resolve(data);
    });
  });
}

module.exports = getTweetsAsync;