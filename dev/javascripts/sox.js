$(function(){
  var sox = io.connect('http://localhost/sox');
  var search;

  // Submit Handler
  $('#findSentiment').submit(function(e){
    e.preventDefault();
    search = $('#search').val();
    sox.emit('clientSearches',search);
    $('#search').val('');
    $('#searchTerm').text(search);
  });

  sox.on('tweetsFound',function(tweets){
    // different animation pattern
    console.log(tweets);
  });

  sox.on('connect', function(){
    console.log('client connected to server...');
  });
  
  sox.on('error',function(){
    // falling back to AJAX
    sendData(search);
  });
  
  sox.on('reconnect_failed',function(){
    // falling back to AJAX
    sendData(search);
  });
});