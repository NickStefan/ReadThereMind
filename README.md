# ReadThereMind

Visualizes twitter sentiment over space and time on an animated map.

### Back End
* Node.js/Express
* Socket.io
* Twitter npm module
* Sentiment npm module
* Bluebird promises
* MongoDB for app persistance and manual geocoding

Twitter caps each Search API request to 100 tweets. Each batch of requests is processed and then piped down to the client using a socket connection while the server continues to asynchronously and recursively query the Twitter API without paging. Most tweets on twitter are not geocoded, and I therefore needed to geocode them manually. I loaded mongodb with geo data from the geonames.org tsv. The db could then be queried with a regex match in order to geocode location-less tweets.

### Front End
* Socket.io
* d3.js
* mapbox.js
* jQuery
* bootstrap

Sox.js attempts to create a socket connection on page load. If the connection is succesful, sox.js keeps the connection open and will begin animating batches of tweets the moment they arrive. If the connection fails, sox.js will delegate to client.js which will revert to an ajax preferred server API and a different animation that is designed to be more friendly with that "all at once" approach.

Regardless, on page load, client.js always loads up a png tiled mapbox.js map of the world and sets up the map.

"Socket Open and Prefered Animation": Tweets are animated, in order, to the map the moment they are received from the server.

"AJAX Fall Back Animation": The user queries the server for a twitter search term. The tweets are individually added to the map on a timescale of 20 to 60 seconds (scaled down from their actual timeline of hours or days). A progress bar of the animation is updated using d3.

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

