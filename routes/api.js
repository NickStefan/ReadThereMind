var express = require('express');
var router = express.Router();
var twitterMachine = require('../twitterHandler');

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
  console.log("posted")
  var response = [];
  var count = 0;
  
  var getMaxHistory = function (data) {
    var max_id, options, oldest, newest;
    if (data.length > 0) {
      // data[0] is oldest tweet
      max_id = data[data.length - 1].id - 1;
      options = { count: 100, max_id: max_id };
      newest = data[0].created_at;
      oldest = data[data.length - 1].created_at;

      response = response.concat(data);
    }
    count++;

    console.log("requests ", count, max_id, oldest, newest);
    

    if (data.length < 2 || count === 15) {
      // filter for geo data'd tweets and TODO hit database
      console.log(response.length," tweets");
      response = response.filter(function(v,k,c){ return v.geo;});
      console.log(response.length, " geo tweets");
      res.json(response);
    } else {
      twitterMachine(req.body.search, options).then( getMaxHistory );
    }
  };

  twitterMachine(req.body.search,{count: 100}).then( getMaxHistory );
});

module.exports = router;