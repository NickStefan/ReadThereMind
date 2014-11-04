var twitter = require('twitter');
var sentiment = require('../sentiment/sentimentHandler');
var Promise = require('bluebird');
var geoAsync = require('../db').geoAsync;
var config = {};

if (process.env.NODE_ENV === 'production') {
  config.consumer_key = process.env.twit_consumer_key;
  config.consumer_secret = process.env.twit_consumer_secret;
  config.access_token_key = process.env.twit_token_key;
  config.access_token_secret = process.env.twit_token_secret;
} else {
  config = require('./twitterKeys');
}

var twitterClient = new twitter(config);

function twitterSearchAsync(search,options) {
  return new Promise(function(resolve,reject){
    twitterClient.search(search,options,function(data){
      if (data.statuses !== undefined){
        console.log("success ", data.statuses.length, " tweets");
        resolve(data.statuses);
      } else {
        console.log("success ", 0, " tweets");
        console.log(data);
        resolve([]);
      }
    });
  });
}

var getTweets = function(text, options, callback) {
  
  twitterSearchAsync(text, options).map(function(tweet) {
    var resp = {
      type: 'Feature',
      properties: {}
    };
    return geoAsync(tweet.geo, tweet.user.location).then(function(data){
      if (data === null || data[0] === undefined){
        resp.geometry = false;
      } else {
        resp.geometry = {
          type: "Point",
          coordinates: [data[1],data[0]]
        };
      }
      resp.properties.location = tweet.user.location;
      resp.properties.screen_name = tweet.user.screen_name;
      resp.properties.text = tweet.text;
      resp.properties.id = tweet.id;
      resp.properties.created_at = tweet.created_at;
      resp.properties.sentiment = sentiment(tweet.text).score;
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