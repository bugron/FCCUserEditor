var express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  config = require('../config'),
  ObjectID = require('monk').id;

/* GET home page */
router.get('/', function(req, res, next) {
  var db = req.db,
    collection = db.get('user');

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

      return res.render('index', {
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

/* GET a seed file */
router.get('/files/:filePath/:fileName', function(req, res, next) {
  fs.readFile(`${config.fccPath}/${req.params.filePath}/${req.params.fileName}`,
  'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.json(data);
  });
});

/* DELETE a User from DB */
router.post('/deleteuser', function(req, res) {
  var db = req.db,
    userID = req.body._id,
    userName = req.body.username,
    collection = db.get('user');

  collection.remove({
    _id: ObjectID(userID)
  }, function(err) {
    if (err) {
      res.status(404).send('There is a problem removing ' + userName +
        ' from the database.');
    } else {
      res.status(200).send(userName + ' is successfully removed from the ' +
        'database!');
    }
  });
});

/* GET Users from DB */
router.post('/getusers', function(req, res) {
  var db = req.db,
    collection = db.get('user');

  collection.find({}, {fields: {password: 0}}, function(e, users) {
    var namesObj = [];
    if (users.length) {
      namesObj = users;
    }
    res.json(namesObj);
  });
});

/* Add or Update a User object */
router.post('/updateuser', function(req, res) {
  var db = req.db,
    User = JSON.parse(req.body.data),
    searchObj = {},
    newUser = !!User.upsert,
    collection = db.get('user');

  if (newUser) {
    searchObj = {username: User.username};
    delete User._id;
  } else {
    searchObj = {_id: ObjectID(User._id)};
  }
  delete User.upsert;

  collection.update(searchObj, User, {upsert: newUser}, function(err) {
    if (err) {
      res.status(404).send('There is a problem with ' +
        (newUser ? 'adding ' : 'updating ') + User.username);
    } else {
      res.status(200).send(User.username + ' is successfully ' +
        (newUser ? 'added' : 'updated') + '!');
    }
  });
});

module.exports = router;
