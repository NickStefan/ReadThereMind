var dblite = require('dblite');
var db = dblite('./geonames-sqlite/geonames.sqlite3');
var Promise = require('bluebird');

function dbAsync(sql, strLocation) {
	return new Promise(function(resolve,reject){
    db.query(sql,[strLocation],function(err,data){
    	//console.log("db", err, data);
    	resolve(err,data);
    });
	});
}

var geocoder = function(givenGeo,strLocation,cb){
	//console.log(strLocation);
	if (givenGeo !== null) {
    cb(null, givenGeo);
	} else {
		// regex out any 'the' ', CA' etc
		strLocation = strLocation.replace(/the(\s+)?/i,"");
		strLocation = strLocation.replace(/,(\s+)?(\w+)$/i,"");
		strLocation = strLocation.replace(/[^\w|\s]/,"");
		strLocation += '*';
		sql = "SELECT * FROM geoname_fulltext WHERE longname MATCH ? AND country = 'United States' ORDER BY population DESC LIMIT 1";
	  
	  dbAsync(sql, strLocation).then(function(err,data){
	  	console.log(err, data);
	  	cb(err,data);
	  });
    // db.query(sql,[strLocation],cb);
	}
}


module.exports = geocoder;