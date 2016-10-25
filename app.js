/*
var redis_info = {
	host: 'redis-15663.c9.us-east-1-4.ec2.cloud.redislabs.com',
	port: 15663,
	password: 'helloredis'
}
*/
var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
var redis_info = vcap_services[Object.keys(vcap_services)[0]][0]['credentials'];

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redis = require('redis');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var redisClient = redis.createClient({
	host: redis_info.host,
	port: redis_info.port,
	password: redis_info.password
});
app.use(session({
  secret: 'keyboard cat',
  store: new redisStore({
	client: redisClient,
	ttl:  260
  }),
  resave: false,
  saveUninitialized: true
}));


app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
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
    message: err.message,
    error: {}
  });
});


module.exports = app;
