var receiveData = function(data){
	$('.results').html('');
	for (var i = 0; i < data.length; i++){
		console.log(data[i].geo);
		console.log(data[i].user.location);
		console.log(data[i].created_at);
		var tweet = $('<div>').text(data[i].text);
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

