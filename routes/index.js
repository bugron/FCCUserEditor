var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* DELETE a User. */
router.post('/deleteuser', function(req, res) {
  var db = req.db;
  var userName = req.body.username;
  var collection = db.get('user');
  collection.remove({
    username: userName
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

/* GET users from DB */
router.post('/getusers', function(req, res) {
  var db = req.db;
  var collection = db.get('user');
  collection.find({}, {}, function(e, users) {
    var namesObj = [];
    if (users.length) {
      namesObj = users;
    }
    res.json(namesObj);
  });
});

/* POST to Add User Service */
router.post('/updateuser', function(req, res) {

  // Set our internal DB variable
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var User = JSON.parse(req.body.data);

  // Set our collection
  var collection = db.get('user');

  // Submit to the DB
  collection.update({
    username: User.username
  }, User, {upsert: true}, function(err) {
    if (err) {
      // If it failed, return error
      res.status(404).send('There was a problem adding the information to ' +
        'the database.');
    } else {
      res.status(200).send('We\'ve successfully updated the information ' +
        'in the database!');
      /* If it worked, set the header so the address bar doesn't
      still say /adduser*/
      // res.location("userlist");
      // And forward to success page
      // res.redirect("userlist");
    }
  });
});

module.exports = router;
