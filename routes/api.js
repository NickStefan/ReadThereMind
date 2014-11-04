var express = require('express');
var router = express.Router();
var twitterMachine = require('../twitterHandler/twitterHandler');
var db = require('../db');

router.post('/', function(req, res) {
  var response = [];
  var dbAlready;
  var count = 0;

  // cant search geonames as thats our geocoding collection
  if (req.body.search === 'geoname'){
    req.body.search = 'geonames';
  }

  db.fetchTweets(req.body.search).then(function(results){
    var options = {};
    // if searched term in database as a collection:
    // fetch twitter with "since_id" (most recent local DB tweet)
    // only fetch tweets newer than this
    if (results.length > 0) {
      dbAlready = results;
      console.log('results', results.length, '\n');
      since_id = results[ results.length - 1 ].properties.id;
      options.count = 100;
      options.since_id = since_id;
    
    // term not in database as collection:
    } else {
      options.count = 100;
    }
    twitterMachine(req.body.search, options).then( getMaxHistory );
  });
  

  function getMaxHistory (data) {
    var max_id, options, oldest, newest;

    // twitter has sent back tweets:
    if (data.length > 0) {
      // get oldest tweet of what twitter sent us and only retrieve
      // tweets older than this until either: 
      //   no more tweets sent back,
      //   1500 tweets total sent to us,
      //   since_id reached (only if term already in DB collections)
      max_id = data[data.length - 1].properties.id - 1;
      options = {};
      options.count = 100;
      options.max_id = max_id;
      if (dbAlready) {
        options.since_id = dbAlready[ dbAlready.length - 1 ].properties.id;
      }
      newest = data[0].properties.created_at;
      oldest = data[data.length - 1].properties.created_at;
      response = response.concat(data);
    }
    count++;

    console.log('requests ', count, '\n', oldest, ' to ', newest, '\n');
    
    // no more tweets from twitter:
    if (data.length < 2 || count === 15) {
      // filter for geo data'd tweets and insert into database
      console.log(response.length,' tweets fetched from twitter');
      response = response.filter(function(v,k,c){ return v.geometry;}).reverse();
      console.log(response.length, ' tweets geocoded');
      
      // if any new tweets geocoded, insert them and then retrieve all DB
      if (response.length > 0) {
        db.insertTweets(req.body.search, response).then(function(data){
          console.log(data.length, ' inserted to DB');
          db.fetchTweets(req.body.search).then(function(data){
            console.log(data.length, ' retrieved from DB');
            res.json({
              type:"FeatureCollection",
              features: data
            });
          });
        });
        
      // else no new tweets geocoded, retrieve from DB
      } else {
        db.fetchTweets(req.body.search).then(function(data){
          console.log(data.length, ' retrieved from DB');
          res.json({
            type:"FeatureCollection",
            features: data
          });
        });
      }

    // still more tweets to go get, recurse:
    } else {
      twitterMachine(req.body.search, options).then( getMaxHistory );
    }
  }

});

module.exports = router;