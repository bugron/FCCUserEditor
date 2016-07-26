var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var fs = require('fs');
var config = require('./config');
var logger = require('morgan');
var bodyParser = require('body-parser');

// New Code
var monk = require('monk');
var db = monk('localhost:27017/freecodecamp');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.use('/', routes);

app.get('/files', function(req, res, next) {
  var db = req.db;
  var collection = db.get('user');
  collection.find({}, {fields: {password: 0}}, function(e, users) {
    var fileObj;
    fs.readdir(config.fccPath, function(err, files) {
      if (err) {
        return next(err);
      }

      fileObj = files.reduce(function(acc, curr) {
        acc[curr] = fs.readdirSync(`${config.fccPath}/${curr}`);
        return acc;
      }, {});

      return res.render('fileslist', {
        title: 'FCCUserEditor: Easily create/edit FCC user ' +
          'objects for testing purposes',
        userList: users.map(function(user) {
          var map = user.challengeMap;
          if (map) {
            for (var id in map) {
              if (map.hasOwnProperty(id) && map[id].solution) {
                delete map[id].solution;
              }
            }
          }
          return user;
        }),
        filelist: fileObj
      });
    });
  });
});

app.get('/files/:filePath/:fileName', function(req, res, next) {
  fs.readFile(`${config.fccPath}/${req.params.filePath}/${req.params.fileName}`,
  'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.json(data);
  });
});

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.set('port', process.env.PORT || 3005);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
