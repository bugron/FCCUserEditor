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
  }, function (err, doc) {
    if (err) {
      res.send("There was a problem removing the information from the database.");
    }
    else {
      res.send("The user '" + userName + "' was successfully removed from the database!");
    }
  });
})

/* POST to Add User Service */
router.post('/updateuser', function(req, res) {

  // Set our internal DB variable
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var User = req.body;

  // Set our collection
  var collection = db.get('user');

  // Submit to the DB
  collection.update({
    username: User.username
  }, User, {upsert: true}, function (err, doc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem adding the information to the database.");
    }
    else {
      res.send("We've successfully updated the information in the database!");
      // If it worked, set the header so the address bar doesn't still say /adduser
      //res.location("userlist");
      // And forward to success page
      //res.redirect("userlist");
    }
  });
});

module.exports = router;
