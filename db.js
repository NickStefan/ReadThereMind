var Promise = require('bluebird');
var mongo = require('mongoskin');
var fs = require("fs");

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/tweets';

var db = mongo.db(mongoUri,{native_parser:true});

var writeGeoDB = function(geoRec){
  db.collection('geoname').insert(geoRec,function(err,results){
    if (err) {
      console.log(err);
    } else {
      console.log('geo db rebuilt')
      console.log('geo db ready');
    }
  });
};

var checkGeo = function(){
  return new Promise(function(resolve,reject){
    db.collection('geoname').find().toArray(function(err,data){
      if (err) console.log(err);
      resolve(data);
    });
  });
};

// // repopulate the db on restart to avoid problems
// // not ideal in actual production
// db.collection('geoname').drop();

// if geoDb not ready, write to DB
checkGeo().then(function(data){
  if (data.length > 0){
    console.log('geo db ready');
  } else {
    // populate geoDB from geonames tsv
    var cities = fs.readFileSync('./cities15000.txt').toString().split("\n");
    cities.pop(); // empty element
    var processedCities = cities.map(function(city) {
      var data = city.split('\t');
      var names = data[3].split(',');
      return {
        _id: Number(data[0]),
        name: data[1],
        country: data[8],
        alternate_names: names.map(function(name) {
          return name.toLowerCase();
        }),
        coordinates: [Number(data[4]), Number(data[5])]
      }
    });
     
    writeGeoDB(processedCities);
  }

});


// app persistance functions

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

function dbAsync(strLocation) {
  return new Promise(function(resolve,reject){
    db.collection('geoname').find({
        "name": new RegExp(strLocation + '(.+)?',"gi"),
        "country": "US"
    }).toArray(function(err,data){
      if (err) console.log(err);
      if (data[0] !== undefined){
        point = data.sort(function(a,b){return b.population - a.population})[0];
        data = [point.coordinates[0], point.coordinates[1]];
      } else {
        data = null;
      }
      resolve(data);
    });
  });
}

// geocode location-less tweets

var geocoder = function(givenGeo,strLocation,cb){
  if (givenGeo !== null) {
    return cb(null, givenGeo.coordinates);
  } else {
    // regex out any non alpha characters, but leave in , (it needs to stay in for this step)
    var strLocation1 = strLocation.replace(/[^a-zA-z\s,]|_|\[|\]/gi,"");
    // regex out any leading, double and end spaces, and ', CA'
    var strLocation2 = strLocation1.replace(/^\s+|\s+$|\s+(?=\s)|,.+/gi,"");
    // regex out any non alpha or space character
    var finalStrLocation = strLocation2.replace(/[^\w\s]/,"");

    if (!finalStrLocation) {
      // nothing to search the database with
      return cb(null,null);
    } else {
      dbAsync(finalStrLocation).then(function(data){
        return cb(null,data);
      });
    }
  }
}

function geoAsync(givenGeo,strLocation){
  return new Promise(function(resolve,reject){
    geocoder(givenGeo,strLocation,function(err,data){
      resolve(data);
    });
  });
}

module.exports.geoAsync = geoAsync;
module.exports.fetchTweets = fetchTweets;
module.exports.insertTweets = insertTweets;