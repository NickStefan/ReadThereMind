var receiveData = function(data){
	$('.results').html('');
	for (var i = 0; i < data.length; i++){
		var tweet = $('<div>').html(data[i].text + '<br>' + data[i].sentiment);
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

// var map = new Datamap({
//   element: document.getElementById('container'),
// 	scope: 'usa',
// 	fills: {
// 	        defaultFill: 'rgba(255,255,255,1)', //any hex, color name or rgb/rgba value
// 	    		green: 'green',
// 	    		red: 'red',
// 	    		blue: 'blue',
// 	    },
// 	geographyConfig: {
// 	  borderColor: 'black',
// 	  highlightOnHover: false
// 	}
// });

var map = L.mapbox.map('container', 'fcc.map-toolde8w')
    .setView([40, -94.50], 4);
  // queue()
  //   .defer(d3.json, "test.geojson")
  //   .await(ready);
  // function ready(error, data){
  //   L.geoJson(data).addTo(map);
  //   }

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
// Create a new layer with a special pointToLayer function
// that'll generate scaled points.
var tweetsLayer = L.geoJson(null, { pointToLayer: scaledPoint })
    .addTo(map);

tweetsLayer.addData(data);

function pointColor(feature) {
    return feature.properties.sentiment > 0 ? '#f55' : '#a00';
}

function pointRadius(feature) {
    return feature.properties.sentiment;
}

function scaledPoint(feature, latlng) {
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

  // // clear any timeouts from the old query
  // if (timeoutCodes.length > 0) {
  //   timeoutCodes.forEach(function(v,k,c) {
  //     clearTimeout(v);
  //   });
  // }

  // scaleTimeFunc = scaleTime(data[data.length-1].created_at, data[0].created_at, 20);
  
  // // this stuff was originally on the server to increase
  // // the users perception of speed, but its more 'view logic'
  // // and such I've put it on the client for now.
  // data.forEach(function(v,k,c){
  //   v.radius = (Math.abs(v.sentiment) + 5) * 1.5;
  //     if (v.sentiment > 0) {
  //       v.fillKey = "green";
  //     } else if (v.sentiment < 0){
  //       v.fillKey = "red";
  //     } else {
  //       v.fillKey = "blue";
  //     }
  // });
  
  // data.reverse().forEach(function(v,k,c){

  //   var code = setTimeout(function(){

  //     map.bubbles(c.slice(0,k+1),{
		//     popupTemplate: function (geo, data) {
		//       return ['<div class="hoverinfo">' + data.screen_name + '<br/>' + data.text,
		//       '<br/>Date: ' +  data.created_at,
  //         '<br/>Sentiment: ' + data.sentiment,
		//       '</div>'].join('');
		//     }
		//   });

  //   }, scaleTimeFunc(v.created_at));
  
  //   timeoutCodes.push(code);
  // });

}


