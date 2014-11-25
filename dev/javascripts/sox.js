// tweetsLayer and sendData defined in client.js

$(function(){
  var sox = io.connect('/sox');
  var search;

  // Submit Handler
  $('#findSentiment').submit(function(e){
    e.preventDefault();
    search = $('#search').val();
    sox.emit('clientSearches',search);
    clearTweetLayer();
    $('#search').val('');
    $('#searchTerm').text(search);
  });

  sox.on('tweetsFound',function(tweets){
    // different animation pattern
    updateMapSox(tweets);
  });

  sox.on('connect', function(){
    console.log('client connected to server...');
  });
  
  sox.on('error',function(){
    // falling back to AJAX
    // and ajax friendly animation
    sendData(search);
  });
  
  sox.on('reconnect_failed',function(){
    // falling back to AJAX
    // and ajax friendly animation
    sendData(search);
  });
});

var timeoutCodesSox = [];
var displayedSox = {};

function clearTweetLayer(){
  // clear any timeouts, pre-existing map data, and pop ups from the old query
  if (timeoutCodesSox.length > 0){
    timeoutCodesSox.forEach(function(v,k,c) {
      clearTimeout(v);
    });
  }
  tweetsLayer.clearLayers();
}

function scaleTime(items){
  return function(point){
    if (items < 100){
      return point * 400;
    }
    if (items < 1000 && items > 100){
      return point * 40;
    }
    if (items < 10000 && items > 1000){
      return point * 4;
    }
    return point;
  };
}

function updateMapSox(data) {

    var scaleTimeFunc = scaleTime(data.length);

    // for each tweet, set a delay to add new tweet
    data.forEach(function(v,k,c){

      var code = setTimeout(function(){
        tweetsLayer.addData(v);
        // programmatically open the popup
        var id = Object.keys(tweetsLayer._layers).sort(function(a,b){return parseInt(b) - parseInt(a);})[0];
        var latlng = {latlng: L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]) };
        
        // only open 1 popup for every second
        if (scaleTimeFunc(k) % 2000 === 0) {
          tweetsLayer._layers[id]._openPopup(latlng);
        }

      // add each tweet on a scaled time scale rather than actual time scale
      // ie new tweets that are hours apart are added seconds apart etc
      }, scaleTimeFunc(k));
    
      timeoutCodesSox.push(code);
    });

  } 