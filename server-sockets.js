var twitterMachine = require('./twitterHandler/twitterHandler');
var db = require('./db');

var socketcalls = function(io){
  io.of('/sox')
    .on('connection', function (socket){
      console.log('client connected...');
      
      socket.on('clientSearches', function (searchTerm){
        var count = 0, dbResults;
        // avoid database conflicts and get any tweets already stored
        db.fetchTweets(checkName(searchTerm))
          .then(handleDbResults)
          .then(twitterAPI);
        
        function handleDbResults(results){
          var options = {}, since_id;
            // term in database as a collection
            if (results.length > 0) {
              console.log(results.length,' found in DB');
              dbResults = results;
              since_id = results[ results.length - 1 ].properties.id;
              options.count = 100;
              options.since_id = since_id;
              // send to client
              socket.emit('tweetsFound',results);
            // term not in database as collection:
            }
            options.count = 100;
            return options;
        }

        function twitterAPI(options){
          twitterMachine(searchTerm,options).then(getMaxHistory);
        }

        function getMaxHistory (data) {
          var max_id, options, oldest, newest;

          // twitter has sent back tweets:
          if (data.length > 1) {
            // get oldest tweet of what twitter sent us 
            // and only retrieve tweets older than this
            options = {};
            options.count = 100;
            if (dbResults){
              options.since_id = dbResults[ dbResults.length - 1 ].properties.id;
            }
            options.max_id = data[data.length - 1].properties.id - 1;
            newest = data[0].properties.created_at;
            oldest = data[data.length - 1].properties.created_at;
            // get more tweets
            if (count < 14) {
              twitterMachine(searchTerm, options).then( getMaxHistory );
            }
          }
          count++;

          dataGeo = data.filter(function(v,k,c){ return v.geometry;}).reverse();
          socket.emit('tweetsFound', dataGeo);
            
          // if any new tweets geocoded, insert them to the DB
          if (dataGeo.length > 0) {
            db.insertTweets(searchTerm, dataGeo).then(function(dataDB){
            });
          }
          console.log(dataGeo.length, ' tweets geocoded');
          console.log('requests ', count, '\n', oldest, ' to ', newest, '\n');
        }
      });

    });
};

function checkName (searchTerm){
  if (searchTerm === 'geoname'){
    searchTerm = 'geonames';
  }
  return searchTerm;
}

module.exports = socketcalls;
