var receiveData = function(data){
	$('.results').html('');
	for (var i = 0; i < data.length; i++){
		console.dir(data[i]);
		var tweet = $('<div>').html(data[i].text + '<br>' + data[i].sentiment);
		$('.results').append(tweet);
	}
}

$('#findSentiment').submit(function(e){
	e.preventDefault();
  var search = $('#search').val();
  sendData(search);
  $('#search').val('');
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

var map = new Datamap({
  element: document.getElementById('container'),
	scope: 'usa',
	fills: {
	        defaultFill: 'rgba(255,255,255,1)' //any hex, color name or rgb/rgba value
	    },
	geographyConfig: {
	  borderColor: 'black',
	  highlightOnHover: false
	}
});

// var tweets;
// d3.csv('cyclones10-14.csv', function(csv){
//   tweets = d3.nest()
//     .key(function(d){ return moment(d.ISO_time).format('YYYY , DDD')})
//     .sortKeys(d3.ascending)
//     .entries(csv);
//   var index = 0
//   setInterval(function(){
//     for(var i = 0; i< tweets[index].values.length; i++){
//       // console.log(tweets[index].values[i])
//       tweets[index].values[i].longitude = parseFloat(tweets[index].values[i].Longitude);
//       tweets[index].values[i].latitude = parseFloat(tweets[index].values[i].Latitude);
//       tweets[index].values[i].radius = 4
//     }
//     console.log(tweets[index].values)
//     //console.log(tweets[index].values);
//     map.bubbles(tweets[index].values, {
//       popupTemplate: function (geo, data) {
//         console.log(data)
//               return ['<div class="hoverinfo">' +  data.name,
//               '<br/>Date: ' +  data.date + '',
//               '</div>'].join('');
//       }
//     });
//     index++
//   }, 100);

// });

