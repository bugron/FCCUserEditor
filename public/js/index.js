$(document).ready(function() {
  toastr.options = {
    'closeButton': true,
    'newestOnTop': true,
    'progressBar': true,
    'positionClass': 'toast-bottom-right',
    'preventDuplicates': true,
    'timeOut': '4000'
  };

  $('.user-form').hide();
  $('.option.selected').removeClass('selected');
  $('#middle').css('overflow', 'auto');
  $('#middle').css('height', '500px');

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

  $('#deleteUser').click(function() {
    if ($('.option.selected').length &&
        !$('#deleteUser').hasClass('disabled')
    ) {
      $.post('/deleteuser', {
        username: $('.option.selected').text()
      })
        .done(function() {
          toastr.success('User is successfully deleted from the DB!');
          updateUsernames();
        })
        .fail(function() {
          toastr.error('Some error occoured.');
        });
    }
  });

  $('#markComplete').click(function(e) {
    if ($('#inputUserPass').val() &&
        $('#inputUserName').val() &&
        $('#inputUserEmail').val() &&
        !$('#markComplete').hasClass('disabled')
    ) {
      e.preventDefault();
      var userObject = {}, currObj = {}, challengeType;
      userObject.completedChallenges = [];
      userObject.progressTimestamps = [];
      $.each($('#middle .random input[type=checkbox]:checked'),
        function(i, checkbox) {
          challengeType = $(checkbox).data('type');
          currObj.completedDate = Date.now();
          currObj.verified = true;
          currObj.name = $(checkbox).next('a').text();
          currObj.id = $(checkbox).data('id');
          currObj.challengeType = challengeType;
          userObject.completedChallenges.push(currObj);
          currObj = {};
          currObj.timestamp = Date.now();
          currObj.completedChallenge = $(checkbox).data('id');
          userObject.progressTimestamps.push(currObj);
          currObj = {};
      });

      userObject.username = $('#inputUserName').val();
      userObject.email = $('#inputUserEmail').val();

      // Synchronously generate a valid 5 rounds bcrypt hash
      var bcrypt = dcodeIO.bcrypt;
      var salt = bcrypt.genSaltSync(5);
      var pass = bcrypt.hashSync($('#inputUserPass').val(), salt);
      userObject.password = pass;

      userObject.name = $('#inputUserCname').val();
      userObject.gender = $('#inputUserGender').val();
      userObject.location = $('#inputUserLocation').val();
      userObject.bio = $('#inputUserBio').val();

      userObject.isBanned = $('#inputIsBanned').prop('checked');
      userObject.isCheater = $('#inputIsCheater').prop('checked');
      userObject.isHonest = $('#inputIsHonest').prop('checked');
      userObject.isLocked = $('#inputIsLocked').prop('checked');
      userObject.isGithubCool = $('#inputIsGithubCool').prop('checked');
      userObject.isMigrationGrandfathered = $('#inputIsMigrationGrandfathered')
        .prop('checked');
      userObject.isUniqMigrated = $('#inputIsUniqMigrated').prop('checked');
      userObject.isBackEndCert = $('#inputIsBackEndCert').prop('checked');
      userObject.isFullStackCert = $('#inputIsFullStackCert').prop('checked');
      userObject.emailVerified = $('#inputIsEmailVerified').prop('checked');
      userObject.sendMonthlyEmail = $('#inputIsSendMonthlyEmail')
        .prop('checked');

      $.post('/updateuser', {
        data: JSON.stringify(userObject),
        dataType: 'json',
        contentType: 'application/json'
      })
        .done(function() {
          toastr.success('User is successfully deleted from the DB!');
          updateUsernames();
        })
        .fail(function() {
          toastr.error('Some error occoured.');
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
    $('#right button').removeClass('disabled');
    index = $(this).data('id');
    $('#middle input[type=checkbox]').prop('checked', false);
    $.each($('#middle .random input[type=checkbox]'), function(i, opt) {
      if (Users[index].completedChallenges) {
        for (var k = 0; k < Users[index].completedChallenges.length; k++) {
          if (
            Users[index].completedChallenges[k].name ===
            $(opt).next('a').text()
          ) {
            $(opt).prop('checked', true);
            break;
          }
        }
      }
    });
    // Bootstrap accordion needs this to work properly
    $('.map-collapse').css('height', '100%');
    $('.collapse:not(".in")').addClass('in');

    if (Users[index].username === $(this).text()) {
      // fill all inputs from a user object
      $('#inputUserName').val(Users[index].username);
      $('#inputUserEmail').val(Users[index].email);
      // $('#inputUserPass').val(Users[index].password);
      $('#inputUserCname').val(Users[index].name);
      $('#inputUserGender').val(Users[index].gender);
      $('#inputUserLocation').val(Users[index].location);
      $('#inputUserBio').val(Users[index].bio);

      $('#inputIsBanned').prop('checked', !!Users[index].isBanned);
      $('#inputIsCheater').prop('checked', !!Users[index].isCheater);
      $('#inputIsHonest').prop('checked', !!Users[index].isHonest);
      $('#inputIsLocked').prop('checked', !!Users[index].isLocked);
      $('#inputIsGithubCool').prop('checked', !!Users[index].isGithubCool);
      $('#inputIsMigrationGrandfathered').prop('checked',
        !!Users[index].isMigrationGrandfathered);
      $('#inputIsUniqMigrated').prop('checked', !!Users[index].isUniqMigrated);
      $('#inputIsBackEndCert').prop('checked', !!Users[index].isBackEndCert);
      $('#inputIsFullStackCert').prop('checked',
        !!Users[index].isFullStackCert);
      $('#inputIsEmailVerified').prop('checked', !!Users[index].emailVerified);
      $('#inputIsSendMonthlyEmail').prop('checked',
        !!Users[index].sendMonthlyEmail);
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
    var self = this;
    if ($(self).val()) {
      $('#right button').removeClass('disabled');
      $.each($('.option'), function() {
        if ($(this).text() === $(self).val()) {
          $('#markComplete').text('Save user');
          return false;
        } else {
          $('#markComplete').text('Add user');
          return true;
        }
      });
    } else {
      $('#right button').addClass('disabled');
    }
  });

  // fill all challenge names
  var files = $('.clickFile');
  var x = 1, ulElem = '<ul class = "collapse map-collapse no-transition ' +
    'random", style="list-style-type:none;padding-left:20px;">';
  $.each(files, function(i, File) {
    var fileTitle = $(File).text();
    var fileDirectory = $(File).parents('ul').prev('b').find('a').text();
    $.getJSON(`/files/${fileDirectory}/${fileTitle}`, function(file) {
      var currFile = JSON.parse(file);
      var ul = $(ulElem);
      for (var i = 0; i < currFile.challenges.length; i++) {
        var checked = '';
        if (index !== -1 && Users[index].completedChallenges) {
          for (var k = 0; k < Users[index].completedChallenges.length; k++) {
            if (
              Users[index].completedChallenges[k].name ===
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
    });
  });
});
