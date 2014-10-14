var twitter = require('twitter');
var config = require('./twitterKeys');
var sentiment = require('./sentimentHandler');
var Promise = require('bluebird');
var geoAsync = require('./geocoder');
 
var twitterClient = new twitter(config);

function twitterSearchAsync(search,options) {
  return new Promise(function(resolve,reject){
    twitterClient.search(search,options,function(data){
      resolve(data.statuses);
    });
  });
}

var getTweets = function(text, options, callback) {
  
  twitterSearchAsync(text, options).map(function(tweet) {
    var resp = {};
    resp = tweet;
    resp.sentiment = sentiment(tweet.text).score;
    return geoAsync(tweet.geo, tweet.user.location).then(function(data){
      if (data && data.length) {
        var geo = {};
        geo.coordinates = [];
        geo.coordinates.push(data[0][6]);
        geo.coordinates.push(data[0][7]);
        console.log(data);
        resp.geo = geo;
      } else {
        resp.geo = null;
      }
      return resp;
    });
  })
  .call("filter",function(v,k,c){
    // only return tweets with geo data
    return v.geo !== null;
  })
  .then(function(response){
      console.log(response);
      callback(response);
  });
};

module.exports = getTweets;