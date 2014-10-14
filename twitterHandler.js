var twitter = require('twitter');
var config = require('./twitterKeys');
var sentiment = require('./sentimentHandler');
var Promise = require('bluebird');
var geocoder = require('./geocoder');
 
var twitterClient = new twitter(config);

function twitterSearchAsync(search,options) {
  return new Promise(function(resolve,reject){
    twitterClient.search(search,options,function(data){
      resolve(data.statuses);
    });
  });
}

function geoAsync(givenGeo,strLocation){
  return new Promise(function(resolve,reject){
    geocoder(givenGeo,strLocation,function(err,data){
      resolve(err,data);
    });
  });
}

var getTweets = function(text, options, callback) {
  
  twitterSearchAsync(text, options).map(function(tweet) {
    var resp = {};
    resp = tweet;
    resp.sentiment = sentiment(tweet.text).score;
    return geoAsync(tweet.geo, tweet.user.location).then(function(err,data){
      //console.log("Data", err, data);
      if (err){
        console.log("Err", err);
      } else if (data && data.length) {
        console.log("db")
        var geo = {};
        geo.coordinates = [];
        geo.coordinates.push(data[0][6]);
        geo.coordinates.push(data[0][7]);
        resp.geo = geo;
      } else {
        console.log('null');
        resp.geo = null;
      }
      return resp;
    });
  })
  // .call("filter",function(v,k,c){
  //   // only return tweets with geo data
  //   return !!v.geo;
  // })
  .then(function(response){
      callback(response);
  });
};

module.exports = getTweets;