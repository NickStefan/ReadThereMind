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

