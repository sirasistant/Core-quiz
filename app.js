var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials=require('express-partials');
var methodOverride = require('method-override');
var session=require('express-session');
var azureStorage = require('azure-storage');

var blobService = azureStorage.createBlobService(process.env.STORAGE_ACCOUNT, process.env.STORAGE_KEY);

blobService.createContainerIfNotExists('core', function (error, result, response) {
    if (!error) {
        console.log("CORE container created");
    }
    else {
        console.log("An error occurred creating the container: " + error.message);
    }
});

exports.blobService = blobService;

var routes = require('./routes/index');

var app = express();

Array.prototype.repeat= function(what, L){
 while(L) this[--L]= what;
 return this;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  if(!req.session.redir){
    req.session.redir='/';
  }
  if(!req.path.match(/\/login|\/logout/)){
    req.session.redir=req.path;    
  }
  res.locals.session=req.session;
  next();
});

app.use(function(req,res,next){
  var user=req.session.user;
  if(user){
    var lastTime=user.time;
    var currTime=new Date().getTime();
    if(currTime-lastTime>120000){
      req.session.user=undefined;
    }else{
      req.session.user.time=currTime;
    }
  }
  next();
});

app.use('/', routes);

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
      error: err,
      errors:[]
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    errors:[]
  });
});


module.exports = app;
