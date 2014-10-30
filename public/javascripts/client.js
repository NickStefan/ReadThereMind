var receiveData = function(dataObj){
  var data = dataObj.features;
	$('.results').html('');
	for (var i = 0; i < data.length; i++){
		var tweet = $('<div>').html(data[i].properties.text + '<br>' + data[i].properties.sentiment);
		$('.results').append(tweet);
	}
	updateMap(data);
}

$('#findSentiment').submit(function(e){
	e.preventDefault();
  var search = $('#search').val();
  sendData(search);
  $('#search').val('');
  $('#searchTerm').text(search);
});

var sendData = function(data){
	$.ajax({
	  type: 'POST',
	  url: '/api/',
	  data: {search:data},
	  dataType: 'json',
	  success: receiveData
	});	
}

// create the map
var map = L.mapbox.map('container', 'examples.map-i875kd35') // darker map: 'fcc.map-toolde8w'
    .setView([40, -94.50], 4);

// functions for rendering map tweets

var pointColor = function(feature) {
      return feature.properties.sentiment > 0 ? '#f55' : '#a00';
  }

var pointRadius = function(feature) {
    return feature.properties.sentiment;
}

var scaledPoint = function(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: pointRadius(feature),
        fillColor: pointColor(feature),
        fillOpacity: 0.7,
        weight: 0.5,
        color: '#fff'
    }).bindPopup(
        '<h3>' + feature.properties.location + '</h3>' + 
        '<h2>' + feature.properties.screen_name + '</h2>' +
        '<h3>' + feature.properties.text + '</h3>' +
        '<h3>' + new Date(feature.properties.created_at) + '</h3>' +
        feature.properties.sentiment + ' sentiment');
}

// Create a new layer with a special pointToLayer function
// that'll generate scaled points.
var tweetsLayer = L.geoJson(null, { pointToLayer: scaledPoint })
  .addTo(map);

var scaleTime = function(min,max,scale){
	// scale is the scale in seconds that you want to transform into
	var maxTime = moment(max, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
  var minTime = moment(min, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
  var duration = moment.duration(maxTime - minTime);
  var elapse = duration.asHours() * 60;

	return function(arg){
		var locMax = moment(arg, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
    var localElapse = moment.duration(locMax - minTime).asHours() * 60 / elapse;
    // 1000 is for milliseconds, as setTimeout will take milliseconds
    return localElapse * scale * 1000;
	}
}

var timeoutCodes = [];

function updateMap(data) {

  // clear any timeouts from the old query
  if (timeoutCodes.length > 0) {
    timeoutCodes.forEach(function(v,k,c) {
      clearTimeout(v);
    });
  }

  scaleTimeFunc = scaleTime(data[data.length-1].properties.created_at, data[0].properties.created_at, 20);
  
  data.reverse().forEach(function(v,k,c){

    var code = setTimeout(function(){
      
      tweetsLayer.clearLayers();
      tweetsLayer.addData(c.slice(0,k+1));

    }, scaleTimeFunc(v.properties.created_at));
  
    timeoutCodes.push(code);
  });

}


