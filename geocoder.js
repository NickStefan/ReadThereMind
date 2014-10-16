var dblite = require('dblite');
var db = dblite('./geonames-sqlite/geonames.sqlite3');
var Promise = require('bluebird');

function dbAsync(sql, strLocation) {
	return new Promise(function(resolve,reject){
    db.query(sql,[strLocation],function(err,data){
    	if (err) {console.log(err)};
    	resolve(data);
    });
	});
}

var geocoder = function(givenGeo,strLocation,cb){
	if (givenGeo !== null) {
    return cb(null, givenGeo.coordinates);
	} else {
		// regex out any 'the' ', CA' etc
		var finalStrLocation = strLocation.replace(/[\W_]+/gi,"") + '*';
		if (!finalStrLocation) {
			// nothing to search the database with
			return cb(null,null);
		} else {
			sql = "SELECT * FROM geoname_fulltext WHERE longname MATCH ? AND country = 'United States' ORDER BY population DESC LIMIT 1";
		  return dbAsync(sql, finalStrLocation).then(function(data){
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

module.exports = geoAsync;