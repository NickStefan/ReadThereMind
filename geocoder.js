var dblite = require('dblite');
var db = dblite('./geonames-sqlite/geonames.sqlite3');
var Promise = require('bluebird');

function dbAsync(sql, strLocation) {
	return new Promise(function(resolve,reject){
    db.query(sql,[strLocation],function(err,data){
    	resolve(data);
    });
	});
}

var geocoder = function(givenGeo,strLocation,cb){

	if (givenGeo !== null) {
    return cb(null, givenGeo.coordinates);
	} else {
		// regex out any 'the' ', CA' etc
		strLocation = strLocation.replace(/the(\s+)?/i,"");
		strLocation = strLocation.replace(/,(\s+)?(\w+)$/i,"");
		strLocation = strLocation.replace(/[^\w|\s]/,"");
		strLocation += '*';
		sql = "SELECT * FROM geoname_fulltext WHERE longname MATCH ? AND country = 'United States' ORDER BY population DESC LIMIT 1";
	  
	  return dbAsync(sql, strLocation).then(function(data){
	  	return cb(null,data);
	  });
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