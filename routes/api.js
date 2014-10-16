var express = require('express');
var router = express.Router();
var twitterMachine = require('../twitterHandler');

router.get('/', function(req, res) {
  res.render('index', { title: 'API' });
});

// router.post('/', function(req, res) {
// 	var options = {
// 		count: 100
// 	};
//   twitterMachine(req.body.search, options, function (data) {
//     res.json(data);
//   });
// });

// while twitter gives a response, keep fetching with max_id
// should only need to do this once, as history wont get older
// then, all the following times, only fetch new ones using since_id

// if (searched term in database)
//   fetch twitter api with since_id until no new responses
//   twitterMachine + options{since_id: dbresults_most_recent_id}
// else // ie not in the db yet
//   fetch twitter api with max_id until no new responses
//   twitterMachine + options{max_id: dbresults_oldest_id}
//
// fetch all tweets from db and res.json(data)

// need to look into mongodb on heroku???

router.post('/', function(req, res) {
  console.log("posted")
  var response = [];
  var temp;
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

    console.log('datad', max_id, oldest, newest);
    count++;

    if (data.length < 2 || count === 15) {
      // filter and hit database
      console.log("no more", response.length);
      res.json(response.filter(function(v,k,c){ return v.geo;}));
    } else {
      twitterMachine(req.body.search, options).then( getMaxHistory );
    }
  };

  twitterMachine(req.body.search,{count: 100}).then( getMaxHistory );
});

module.exports = router;