var twitterMachine = require('./twitterHandler/twitterHandler');
var db = require('./db');

var socketcalls = function(io){
  io.of('/sox')
    .on('connection', function (socket){
      console.log('client connected...');
      
      socket.on('clientSearches', function (searchTerm){
        var count = 0, dbAlready;
        // avoid database conflicts and get any tweets already stored
        db.fetchTweets(checkName(searchTerm))
          .then(handleDbResults)
          .then(twitterAPI);
        
        function handleDbResults(results){
          var options = {};
            // term in database as a collection
            if (results.length > 0) {
              dbAlready = results;
              since_id = results[ results.length - 1 ].properties.id;
              options.count = 100;
              options.since_id = since_id;
              // send to client
              socket.emit('tweetsFound',results);
            // term not in database as collection:
            } else {
              options.count = 100;
            }
            return options;
        }

        function twitterAPI(options){
          twitterMachine(searchTerm,options).then(getMaxHistory);
        }

        function getMaxHistory (data) {
          var max_id, options, oldest, newest;

          // twitter has sent back tweets:
          if (data.length > 0) {
            // get oldest tweet of what twitter sent us 
            // and only retrieve tweets older than this
            max_id = data[data.length - 1].properties.id - 1;
            options = {};
            options.count = 100;
            options.max_id = max_id;
            if (dbAlready) {
              options.since_id = dbAlready[ dbAlready.length - 1 ].properties.id;
            }
            newest = data[0].properties.created_at;
            oldest = data[data.length - 1].properties.created_at;
            // get more tweets
            twitterMachine(searchTerm, options).then( getMaxHistory );
          }
          count++;

          console.log('requests ', count, '\n', oldest, ' to ', newest, '\n');
          dataGeo = data.filter(function(v,k,c){ return v.geometry;}).reverse();
          console.log(dataGeo.length, ' tweets geocoded');
          socket.emit('tweetsFound', dataGeo);
            
          // if any new tweets geocoded, insert them to the DB
          if (dataGeo.length > 0) {
            db.insertTweets(searchTerm, dataGeo).then(function(dataDB){
              console.log(dataDB.length, ' inserted to DB');
            });
          }
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
