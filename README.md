# ReadThereMind

Visualizes twitter sentiment over space and time on an animated map.

### Back End
* Node.js/Express
* Twitter npm module
* Sentiment npm module
* Bluebird promises
* SQLite3 db for geocoding geo-less tweets
* MongoDB for app persistance

Server asynchronously and recursively queries Twitter API without paging. Most tweets on twitter are not geocoded, and I therefore needed to geocode them manually. Manual geocoding was done by querying a SQLite db created from a tsv of geonames.org.

### Front End
* d3.js
* mapbox.js
* jQuery
* bootstrap

Client loads up a png tiled mapbox.js map of the world. The user queries the server for a twitter search term. The tweets are individually added to the map on a timescale of 20 to 60 seconds (scaled down from their actual timeline of hours or days). A progress bar of the animation is updated using d3.

