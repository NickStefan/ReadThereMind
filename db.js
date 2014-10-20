var Promise = require('bluebird');
var mongo = require('mongoskin');
var db = mongo.db('mongodb://localhost:27017/tweets',{native_parser:true});

var fetchTweets = function(search){
  return new Promise(function(resolve,reject){
    db.collection(search).find().toArray(function(err,data){
      if (err) console.log(err);
      resolve(data);
    });
  });
};

var insertTweets = function(search, tweets){
  return new Promise(function(resolve,reject){
    db.collection(search).insert(tweets, function(err, result){
      if (err) console.log(err);
      resolve(result);
    });
  });
};

module.exports.fetchTweets = fetchTweets;
module.exports.insertTweets = insertTweets;