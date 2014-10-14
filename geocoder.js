var dblite = require('dblite');
var db = dblite('./geonames-sqlite/geonames.sqlite3');

var geocoder = function(text){
  return db.query("SELECT * FROM geoname_fulltext WHERE longname MATCH ? ORDER BY population DESC LIMIT 1",[text]);
}


module.exports = geocoder;