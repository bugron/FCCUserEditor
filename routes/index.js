var express = require('express'),
    router = express.Router(),
    ObjectID = require('mongodb').ObjectID;

/* GET home page */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* DELETE a User from DB */
router.post('/deleteuser', function(req, res) {
  var db = req.db,
    userID = req.body._id,
    userName = req.body.username,
    collection = db.get('user');

  collection.remove({
    '_id': ObjectID(userID)
  }, function(err) {
    if (err) {
      res.status(404).send('There was a problem removing the information' +
        'from the database.');
    } else {
      res.status(200).send('The user ' + userName + ' was successfully ' +
        'removed from the database!');
    }
  });
});

/* GET Users from DB */
router.post('/getusers', function(req, res) {
  var db = req.db,
    collection = db.get('user');

  collection.find({}, {}, function(e, users) {
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
    searchObj = {'_id': ObjectID(User._id)};
  }
  delete User.upsert;

  collection.update(searchObj, User, {upsert: newUser}, function(err) {
    if (err) {
      res.status(404).send('There was a problem adding the information to ' +
        'the database.');
    } else {
      res.status(200).send('We\'ve successfully updated the information ' +
        'in the database!');
    }
  });
});

module.exports = router;
