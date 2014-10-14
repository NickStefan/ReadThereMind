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

function updateMap(data) {
  scaleTimeFunc = scaleTime(data[data.length-1].created_at, data[0].created_at, 20);
  
  data.reverse().forEach(function(v,k,c){

    setTimeout(function(){

      map.bubbles(c.slice(0,k+1),{
		    popupTemplate: function (geo, data) {
		      return ['<div class="hoverinfo">' + data.screen_name + '<br/>' + data.text,
		      '<br/>Date: ' +  data.created_at + '',
		      '</div>'].join('');
		    }
		  });

    }, scaleTimeFunc(v.created_at));

  });

}


