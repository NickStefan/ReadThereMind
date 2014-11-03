$(function(){
  // set the map width and height on page load
  var width = $(window).width() - 20;
  var height = $(window).height() - 100;
  $('#map-container').css('width',width + 'px');
  $('#map-container').css('height',height + 'px');

  // show loading animation on AJAX
  var showPleaseWait = function() {
    $('#Searching_Modal').modal('show');
  }
  var hidePleaseWait = function () {
    $('#Searching_Modal').modal('hide');
  }
  
  // update page on AJAX success
  var receiveData = function(dataObj){
    hidePleaseWait();
    var data = dataObj.features;
  	updateMap(data);
  }
  
  // AJAX tweet search
  $('#findSentiment').submit(function(e){
  	e.preventDefault();
    var search = $('#search').val();
    sendData(search);
    $('#search').val('');
    $('#searchTerm').text(search);
  });

  var sendData = function(data){
    showPleaseWait();
  	$.ajax({
  	  type: 'POST',
  	  url: '/api/',
  	  data: {search:data},
  	  dataType: 'json',
  	  success: receiveData
  	});	
  }

  // create the map
  var map = L.mapbox.map('map-container', 'examples.map-i875kd35') // darker map: 'fcc.map-toolde8w'
    .setView([40, -94.50], 4);

  // functions for rendering map tweets

  var pointColor = function(feature) {
      var sentiment = feature.properties.sentiment;
      var color;
      if (sentiment > 0) {
        color = 'rgb(12,178,0)';
      } else if (sentiment === 0) {
        color = 'rgb(77,62,178)';
      } else {
        color = 'rgb(255,105,0)';
      }
      return color;
    }

  var pointRadius = function(feature) {
    return (feature.properties.sentiment > 5) * 1.2 ? feature.properties.sentiment : 5;
  }

  var scaledPoint = function(feature, latlng) {
    var sentiment = feature.properties.sentiment > 0 ?
      "+" + feature.properties.sentiment :
      feature.properties.sentiment;

    return L.circleMarker(latlng, {
        radius: pointRadius(feature),
        fillColor: pointColor(feature),
        fillOpacity: 0.7,
        weight: 0.5,
        color: '#fff'
    }).bindPopup(
        '<h4>' + feature.properties.location + '</h4>' + 
        '<h3>' + feature.properties.screen_name + '</h3>' +
        '<h4>' + feature.properties.text + '</h4>' +
        '<h4>' + moment(feature.properties.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').calendar() + '</h4>' +
        '<h3>' + sentiment + ' sentiment' + '</h3>'
      );
  }

  // helper functions for calculations

  // scale hours down to seconds
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
  
  // round to nearest n (ie 10 or 100 or 1000)
  var nearest = function(n, v) {
    n = n / v;
    n = (n < 0 ? Math.floor(n) : Math.ceil(n)) * v;
    return n;
  }

  // Create a new layer with a special pointToLayer function
  // that'll generate scaled points.
  var tweetsLayer = L.geoJson(null, { pointToLayer: scaledPoint })
    .addTo(map);

  var timeoutCodes = [];
  var statusCodes = [];
  var displayed = {};

  function updateMap(data) {

    // clear any timeouts, pre-existing map data, and pop ups from the old query
    if (timeoutCodes.length > 0){
      timeoutCodes.forEach(function(v,k,c) {
        clearTimeout(v);
      });
    }
    if (statusCodes.length > 0){
      statusCodes.forEach(function(v,k,c) {
        clearTimeout(v);
      });
    }
    tweetsLayer.clearLayers();
    displayed = {};

    // calculate the time scale to display the tweets over

    secondsRange = nearest(data.length,100) / 20;
    scaleTimeFunc = scaleTime(data[0].properties.created_at, data[data.length-1].properties.created_at, secondsRange);

    // for each tweet, set a delay to add new tweet
    data.forEach(function(v,k,c){

      var code = setTimeout(function(){
        tweetsLayer.addData(v);
        // programmatically open the popup
        var id = Object.keys(tweetsLayer._layers).sort(function(a,b){return parseInt(b) - parseInt(a);})[0];
        var latlng = {latlng: L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]) };
        var time = nearest(scaleTimeFunc(v.properties.created_at),1000);
        
        // only open 1 popup for every second
        if (!displayed[time]){
          if (time % 1000 === 0) {
            tweetsLayer._layers[id]._openPopup(latlng);
            displayed[time] = true;
          }
        }
      // add each tweet on a scaled time scale rather than actual time scale
      // ie new tweets that are hours apart are added seconds apart etc
      }, scaleTimeFunc(v.properties.created_at));
    
      timeoutCodes.push(code);
    });
    
    // for each second in the tweet time scale, update progress bar
    map.legendControl.addLegend('<div></div>');
    
    // adjust the secondsRange to the progress bar size of 300px
    progressStep = 300 / secondsRange;

    d3.select('.map-legend').append('svg')
      .attr('class','legendary')
      .style('width', '300px')
      .style('max-height','40' + 'px');

    d3.select('.legendary').append('rect')
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 300)
      .attr("height", 20)
      .attr("fill", 'lightblue');

    var j = 0;
    var t = 0;
    for (var i = 0; i < secondsRange; i++){
      var code = setTimeout(function(){
      // 
        d3.select('.legendary').append('rect')
          .attr("x", 10)
          .attr("y", 10)
          .attr("width", j+=progressStep)
          .attr("height", 20);
        // keep track of seconds
        t++;
        // when done loading, remove progress bar
        if (t === secondsRange - 1){
          d3.select('.map-legend').html("");
          d3.select('.map-legends').style("display","none");
        }
      },i*1000);

      statusCodes.push(code);
    }

  }

});


