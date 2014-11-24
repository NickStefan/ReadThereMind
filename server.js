var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');

var app = express();

// view engine setup
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

if (process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, 'dist')));
} else {
  app.use(express.static(path.join(__dirname, 'dev')));
}

app.use('/', routes);
app.use('/users', users);
app.use('/api/', api);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            cache: false,
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        cache: false,
        message: err.message,
        error: {}
    });
});

///// SET UP SERVER TO HANDLE SOCKETS

var debug = require('debug')('readtheremind');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

if (process.env.NODE_ENV === 'production') {
  console.log('port', process.env.PORT);
  console.log('environment', process.env.NODE_ENV);
} else {
  console.log('port', 3000);
  console.log('environment', 'development');
}

// socket io
var io = require('socket.io').listen(server);

var usernames = {};
var clients = {};
var clientNumber = 0;

// io.on('connection', function (socket) {
//   var success = false;
//   console.log('user attempting to connect...');

//   socket.on('addUser', function(username){
//     socket.username = username;
//     socket.usernameID = username + clientNumber.toString()
//     clientNumber += 1;
//     clients[ socket.usernameID ] = socket;
//     usernames[ socket.usernameID ] = username;
//     success = true;

//     console.log(username + " has successfully connected.");
//     console.log("online users", usernames);

//     socket.emit('login', {
//       usernames: usernames,
//       username: username
//     });
    
//     socket.broadcast.emit('userJoined', {
//       username: socket.username
//     });
    
//   });
// });


module.exports = app;
