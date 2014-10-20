var express = require('express');
var router = express.Router();
var twitterMachine = require('../twitterHandler');
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

router.get('/', function(req, res) {
  res.render('index', { title: 'API' });
});

// while twitter gives a response, keep fetching with max_id
// should only need to do this once, as history wont get older
// then, all the following times, only fetch new ones using since_id:

// if (searched term in database)
//   use getMaxHistory() plus "since_id" (most recent local DB tweet)
//   twitterMachine + options{since_id: dbresults_most_recent_id}
// else // ie not in the db yet
//   use getMaxHistory()

// need to look into mongodb on heroku???

router.post('/', function(req, res) {
  var response = [];
  var dbAlready;
  var count = 0;

  fetchTweets(req.body.search).then(function(results){
    var options = {};
    if (results.length > 0) {
      dbAlready = results;
      console.log('results', results.length);
      since_id = results[ results.length - 1 ].id;
      console.log(since_id);
      options.count = 100;
      options.since_id = since_id;
    } else {
      options.count = 100;
    }
    twitterMachine(req.body.search, options).then( getMaxHistory );
  });
  

  function getMaxHistory (data) {
    var max_id, options, oldest, newest;
    if (data.length > 0) {
      // get oldest tweet
      max_id = data[data.length - 1].id - 1;
      options = {};
      options.count = 100;
      options.max_id = max_id;
      if (dbAlready) {
        options.since_id = dbAlready[ dbAlready.length - 1 ].id;
      }
      console.log(since_id);
      newest = data[0].created_at;
      oldest = data[data.length - 1].created_at;

      response = response.concat(data);
    }
    count++;

    console.log("requests ", count, max_id, oldest, newest, "\n");
    

    if (data.length < 2 || count === 15) {
      // filter for geo data'd tweets and TODO hit database
      console.log(response.length," tweets");
      response = response.filter(function(v,k,c){ return v.geo;}).reverse();
      console.log(response.length, " geo tweets");
      
      insertTweets(req.body.search, response).then(function(data){
        console.log("inserted ", data.length);
        fetchTweets(req.body.search).then(function(data){
          console.log("retrieved ", data.length);
          res.json(data);
        });
      });

    } else {
      twitterMachine(req.body.search, options).then( getMaxHistory );
    }
  }

});

module.exports = router;