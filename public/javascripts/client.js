var receiveData = function(data){
	$('.results').html('');
	for (var i = 0; i < data.length; i++){
		var tweet = $('<div>').html(data[i].text + '<br>' + data[i].sentiment);
		$('.results').append(tweet);
		updateMap(data);
	}
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

var map = new Datamap({
  element: document.getElementById('container'),
	scope: 'usa',
	fills: {
	        defaultFill: 'rgba(255,255,255,1)', //any hex, color name or rgb/rgba value
	    		green: 'green',
	    		red: 'red',
	    		blue: 'blue',
	    },
	geographyConfig: {
	  borderColor: 'black',
	  highlightOnHover: false
	}
});

var getDate = function(d) {
  return new Date(d.Date);
};

function updateMap(data) {
  var minTime = getDate(data[0].created_at);
  var maxTime = getDate(data[data.length-1].created_at);
  var ticks = d3.time.scale().domain([minTime, maxTime]).range([0, 60]);

  map.bubbles(data,{
    popupTemplate: function (geo, data) {
      return ['<div class="hoverinfo">' + data.screen_name + '<br/>' + data.text,
      '<br/>Date: ' +  data.created_at + '',
      '</div>'].join('');
    }
  });
}


