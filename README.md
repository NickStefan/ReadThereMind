# ReadThereMind

Visualizes twitter sentiment over space and time on an animated map.

### Back End
* Node.js/Express
* Twitter npm module
* Sentiment npm module
* Bluebird promises
* MongoDB for app persistance and manual geocoding

Server asynchronously and recursively queries Twitter API without paging. Most tweets on twitter are not geocoded, and I therefore needed to geocode them manually. I loaded mongodb with geo data from the geonames.org tsv. The db is then queried with a regex match in order to geocode location-less tweets.

### Front End
* d3.js
* mapbox.js
* jQuery
* bootstrap

Client loads up a png tiled mapbox.js map of the world. The user queries the server for a twitter search term. The tweets are individually added to the map on a timescale of 20 to 60 seconds (scaled down from their actual timeline of hours or days). A progress bar of the animation is updated using d3.

### Development
Fork the repo.   

In order to make the twitter fetching work, you'll need to get twitter keys by creating an app on twitter. Then, edit the 'ALL CAPS' code section below in a text file, and copy/paste into your terminal:   

```
git clone https://github.com/YOURNAME/readtheremind.git &&   
 cd readtheremind &&   
 data="   
 var config = {   
  consumer_key: 'YOUR-TWITTER-CONSUMER-KEY',   
  consumer_secret: 'YOUR-TWITTER-CONSUMER-SECRET',   
  access_token_key: 'YOUR-TWITTER-ACCESS-TOKEN-KEY',   
  access_token_secret: 'YOUR-TWITTER-ACCESS-TOKEN-SECRET'   
};   
module.exports = config;   
" &&   
 echo $data > twitterHandler/twitterKeys.js
```

Install dependencies:
`npm install && bower install`

To run tests, linting, and nodemon for local development:
`gulp dev`

Run plain  `gulp` to minify and concat css and js.

