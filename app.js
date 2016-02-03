var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var fs = require('fs');
var config = require('./config');
var logger = require('morgan');
var bodyParser = require('body-parser');

// New Code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/freecodecamp');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});

app.use('/', routes);

app.get('/files', (req, res, next) => {
  var db = req.db;
  var collection = db.get('user');
  collection.find({},{}, function(e, users) {
    var fileObj;
    fs.readdir(config.fccPath, (err, files) => {
      if (err) {
        return next(err);
      }
      fileObj = files.reduce((acc, curr) => {
        if(!curr.match(/hikes/gi)) {
          acc[curr] = fs.readdirSync(`${config.fccPath}/${curr}`);
        }
        return acc;
      }, {});
      res.render('fileslist', {
        userList: users,
        filelist: fileObj
      });
    });
  });
});

app.get('/files/:filePath/:fileName', (req, res, next) => {
  fs.readFile(`${config.fccPath}/${req.params.filePath}/${req.params.fileName}`,
  'utf8',
  (err, data) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.json(data);
  });
});

/// catch 404 and forwarding to error handler
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
