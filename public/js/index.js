$(document).ready(function() {
  toastr.options = {
    closeButton: true,
    newestOnTop: true,
    progressBar: true,
    positionClass: 'toast-bottom-right',
    preventDuplicates: true,
    timeOut: '4000'
  };

  JSONCache.settings.debug = false;
  JSONCache.settings.itemLifetime = 24 * 60 * 60 * 1000;
  JSONCache.settings.maxCacheSize = 8388608;

  $('.user-form').hide();
  $('.option.selected').removeClass('selected');

  $('#markRandom').on('click', function() {
    if (!$('#markRandom').hasClass('disabled')) {
      $('#middle input[type=checkbox]').prop('checked', false);
      $.each($('#middle .random input[type=checkbox]'), function(i, checkbox) {
        if (Math.random() > 0.6 && !$(checkbox).prop('checked')) {
          $(checkbox).prop('checked', true);
        }
      });
    }
  });

  function updateUsernames() {
    $.post('/getusers').done(function(users) {
      if (users.length) {
        var ulElems = '';
        Users = users;
        for (var i = 0; i < users.length; i++) {
          ulElems += '<li><a class="option" href="#" data-id="' + i +
            '">' + users[i].username + '</a></li>';
        }
        $('.select').empty();
        $('.select').html(ulElems);
        $('#markComplete').text('Save user');
        $(document).on('click', '.option', listenOnChange);
      }
    });
  }

  $('#inputIsRenameMode').click(function() {
    $('#markComplete').text('Save user');
  });

  $('#deleteUser').click(function() {
    if (!$('#deleteUser').hasClass('disabled')) {
      $('#delete-modal').modal('show');
    }
  });

  $('#deleteUser-modal').click(function() {
    if ($('.option.selected').length &&
        !$('#deleteUser').hasClass('disabled')
    ) {
      $.post('/deleteuser', {
        _id: Users[index]._id,
        username: $('.option.selected').text()
      })
        .done(function(data) {
          toastr.success(data);
          updateUsernames();
        })
        .fail(function(data) {
          toastr.error(data);
        })
        .always(function() {
          $('#delete-modal').modal('hide');
        });
    }
  });

  $('#clearCache').click(function() {
    if (!$('#clearCache').hasClass('disabled')) {
      JSONCache.clear();
      var keys = Object.keys(localStorage),
        length = keys.length,
        isClear = true;
      for (var i = 0; i < length; i++) {
        if (keys[i].match(/JSONCache/gi)) {
          isClear = false;
          break;
        }
      }
      if (isClear) {
        toastr.success('Cache is successfully cleared!');
        $('#clearCache').addClass('disabled');
      } else {
        toastr.error('An error occurred while clearing the cache.');
      }
    }
  });

  $('#markComplete').click(function(e) {
    if ($('#inputUserPass').val() &&
        $('#inputUserName').val() &&
        $('#inputUserEmail').val() &&
        !$('#markComplete').hasClass('disabled')
    ) {
      e.preventDefault();
      var userObject = {}, currObj = {}, currChallengeId;
      // userObject.completedChallenges = [];
      userObject.challengeMap = {};
      userObject.progressTimestamps = [];
      $.each($('#middle .random input[type=checkbox]:checked'),
        function(i, checkbox) {
          currChallengeId = $(checkbox).data('id');
          currObj.completedDate = Date.now();
          currObj.verified = true;
          currObj.name = $(checkbox).next('a').text();
          currObj.id = currChallengeId;
          currObj.challengeType = $(checkbox).data('type');
          userObject.challengeMap[currChallengeId] = currObj;
          // userObject.completedChallenges.push(currObj);
          currObj = {};
          currObj.timestamp = Date.now();
          currObj.completedChallenge = currChallengeId;
          userObject.progressTimestamps.push(currObj);
          currObj = {};
      });

      userObject.username = $('#inputUserName').val();
      userObject.email = $('#inputUserEmail').val();

      // Synchronously generate a valid 5 rounds bcrypt hash
      var bcrypt = dcodeIO.bcrypt,
        salt = bcrypt.genSaltSync(5),
        pass = bcrypt.hashSync($('#inputUserPass').val(), salt);
      userObject.password = pass;

      userObject.name = $('#inputUserCname').val();
      userObject.gender = $('#inputUserGender').val();
      userObject.location = $('#inputUserLocation').val();
      userObject.bio = $('#inputUserBio').val();

      userObject.isCheater = $('#inputIsCheater').prop('checked');
      userObject.isHonest = $('#inputIsHonest').prop('checked');
      userObject.isLocked = $('#inputIsLocked').prop('checked');
      userObject.isGithubCool = $('#inputIsGithubCool').prop('checked');
      userObject.isFrontEndCert = $('#inputIsFrontEndCert').prop('checked');
      userObject.isDataVisCert = $('#inputIsDataVisCert').prop('checked');
      userObject.isBackEndCert = $('#inputIsBackEndCert').prop('checked');
      userObject.isFullStackCert = $('#inputIsFullStackCert').prop('checked');
      userObject.isChallengeMapMigrated = true;
      userObject.picture = $('#inputUserPicture').val() ||
        'https://s3.amazonaws.com/freecodecamp/camper-image-placeholder.png';
      userObject.currentStreak = 0;
      userObject.longestStreak = 0;
      userObject.rand = Math.random();
      userObject.timezone = 'Asia/Dubai';
      userObject.theme = $('input[name=nightMode]:checked').val() || 'default';
      userObject.languageTag = 'en';
      userObject.emailVerified = $('#inputIsEmailVerified').prop('checked');
      userObject.sendMonthlyEmail = $('#inputIsSendMonthlyEmail')
        .prop('checked');
      userObject.sendQuincyEmail = $('#inputIsSendQuincyEmail')
        .prop('checked');
      userObject.sendNotificationEmail = $('#inputIsSendNotificationEmail')
        .prop('checked');

      userObject._id = Users[index]._id;
      userObject.upsert = !$('#inputIsRenameMode').prop('checked');

      $.post('/updateuser', {
        data: JSON.stringify(userObject),
        dataType: 'json',
        contentType: 'application/json'
      })
        .done(function(data) {
          toastr.success(data);
          updateUsernames();
        })
        .fail(function(data) {
          toastr.error(data);
        });
    }
  });

  // fetch files but don't check for completed challenges
  var index = -1;
  function listenOnChange(e) {
    e.preventDefault();
    $('.option.selected').removeClass('selected');
    $(this).addClass('selected');
    $('.dropdown-toggle .text').text($(this).text());
    $('#right .change-buttons button').removeClass('disabled');
    index = $(this).data('id');
    $('#middle input[type=checkbox]').prop('checked', false);
    $.each($('#middle .random input[type=checkbox]'), function(i, opt) {
      if (Users[index].challengeMap) {
        for (var id in Users[index].challengeMap) {
          if (
            Users[index].challengeMap.hasOwnProperty(id) &&
            Users[index].challengeMap[id].name === $(opt).next('a').text()
          ) {
            $(opt).prop('checked', true);
            break;
          }
        }
      }
    });
    $('.collapse:not(".in")').addClass('in');

    if (Users[index].username === $(this).text()) {
      // fill all inputs from a user object
      $('#inputUserName').val(Users[index].username);
      $('#inputUserEmail').val(Users[index].email);
      $('#inputUserPicture').val(Users[index].picture);
      // $('#inputUserPass').val(Users[index].password);
      $('#inputUserCname').val(Users[index].name);
      $('#inputUserGender').val(Users[index].gender);
      $('#inputUserLocation').val(Users[index].location);
      $('#inputUserBio').val(Users[index].bio);

      $('#inputIsCheater').prop('checked', !!Users[index].isCheater);
      $('#inputIsHonest').prop('checked', !!Users[index].isHonest);
      $('#inputIsLocked').prop('checked', !!Users[index].isLocked);
      $('#inputIsGithubCool').prop('checked', !!Users[index].isGithubCool);
      $('#inputIsFrontEndCert').prop('checked', !!Users[index].isFrontEndCert);
      $('#inputIsDataVisCert').prop('checked', !!Users[index].isDataVisCert);
      $('#inputIsBackEndCert').prop('checked', !!Users[index].isBackEndCert);
      $('#inputIsFullStackCert').prop('checked',
        !!Users[index].isFullStackCert);
      $('#inputIsEmailVerified').prop('checked', !!Users[index].emailVerified);
      $('#inputIsSendMonthlyEmail').prop('checked',
        !!Users[index].sendMonthlyEmail);
      $('#inputIsSendQuincyEmail').prop('checked',
        !!Users[index].sendQuincyEmail);
      $('#inputIsSendNotificationEmail').prop('checked',
        !!Users[index].sendNotificationEmail);
    }
    // show all user inputs
    $('.user-form').show();
  }

  $(document).on('click', '.option', listenOnChange);

  // check/uncheck current and all children checkboxes
  $('#middle input[type=checkbox]').on('click', function() {
    var toCheck = '';
    if (($(this).prop('checked'))) {
      toCheck = 'checked';
    }
    $(this).parent().find('input[type=checkbox]').
      prop('checked', toCheck);
  });

  // check/uncheck all checkboxes with one click
  $('#globalCheck').on('click', function() {
    var toCheck = '';
    if (($(this).prop('checked'))) {
      toCheck = 'checked';
    }
    $('#middle input[type=checkbox]').prop('checked', toCheck);
  });

  // check if we're going to save a user or to ADD a user
  $('#inputUserName').on('change keyup', function() {
    var msg = '';
    if (this.validity.patternMismatch) {
      msg = 'Username must be lowercase and contain only alphanumeric ' +
        'characters!';
    }
    this.setCustomValidity(msg);

    var self = this;
    if ($(self).val()) {
      $('#right .change-buttons button').removeClass('disabled');
      if (!$('#inputIsRenameMode').prop('checked')) {
        $.each($('.option'), function() {
          if (
            $(this).text() === $(self).val() &&
            !$('#inputIsRenameMode').prop('checked')
          ) {
            $('#markComplete').text('Save user');
            return false;
          } else {
            $('#markComplete').text('Add user');
            return true;
          }
        });
      }
    } else {
      $('#right .change-buttons button').addClass('disabled');
    }
  });

  // fill all challenge names
  var files = $('.clickFile'), x = 1,
    ulElem = '<ul class = "collapse map-collapse no-transition ' +
      'random", style="list-style-type:none;padding-left:20px;">';
  $.each(files, function(i, File) {
    var fileTitle = $(File).text(),
      fileDirectory = $(File).parents('ul').prev('b').find('a').text();
    JSONCache.getCachedJSON(`/files/${fileDirectory}/${fileTitle}`, {
      success: function(file) {
        var currFile = JSON.parse(file),
          ul = $(ulElem);
        for (var i = 0; i < currFile.challenges.length; i++) {
          var checked = '';
          if (index !== -1 && Users[index].challengeMap) {
            for (var id in Users[index].challengeMap) {
              if (
                Users[index].challengeMap.hasOwnProperty(id) &&
                Users[index].challengeMap[id].name ===
                  currFile.challenges[i].title
              ) {
                checked = 'checked="checked"';
                break;
              }
            }
          }
          $('<li><input type="checkbox" data-id="' + currFile.challenges[i].id +
            '" data-type="' + currFile.challenges[i].challengeType + '"' +
            checked + '>' + ' <a href="#">' + currFile.challenges[i].title +
            '</a></li>').appendTo($(ul));
        }
        $(ul).attr('id', 'n-' + x++);
        $(ul).appendTo($(File).parent());
        $(File).attr('href', '#' + $(ul).attr('id'));
        $('#clearCache').removeClass('disabled');
      }
    });
  });
});
