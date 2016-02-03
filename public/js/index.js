$(document).ready(function() {
  $('.user-form').hide();
  $("option:selected").removeAttr("selected");
  $('#middle').css('overflow', 'auto');
  $('#middle').css('height', '500px');

  $('#markRandom').on('click', function() {
    if (!$('#markRandom').hasClass('disabled')) {
      $("#middle input[type=checkbox]").prop('checked', false);
      $.each($("#middle .random input[type=checkbox]"), function(i, checkbox) {
        if (Math.random() > 0.6 && !$(checkbox).prop('checked')) {
          $(checkbox).prop('checked', true);
        }
      });
    }
  });

  $('#deleteUser').click(function() {
    if($("option:selected") && !$('#deleteUser').hasClass('disabled')) {
      $.post('/deleteuser', 
        {
          username: $("option:selected").text()
        },
        function(data) {
          location.reload();
        }
      );      
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
      $.each($("#middle .random input[type=checkbox]:checked"),
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

      $.ajax({
        type: "POST",
        url: '/updateuser',
        data: JSON.stringify(userObject),
        success: function(data) {
          location.reload();
        },
        error: function(data) {
          location.reload();
        },
        dataType: 'json',
        contentType: 'application/json'
      });
    }
  });

  var index = $('select').prop("selectedIndex");
  $('option').on('click', function() {
    $('#markComplete').removeClass('disabled');
    $('#deleteUser').removeClass('disabled');
    $('#markRandom').removeClass('disabled');
    index = $('select').prop("selectedIndex");

    $("#middle input[type=checkbox]").prop('checked', false);
    $.each($("#middle .random input[type=checkbox]"), function(i, opt) {
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
    
    if (Users[index].username === this.value) {
      // fill all inputs from a user object
      $('#inputUserName').val(Users[index].username);
      $('#inputUserEmail').val(Users[index].email);
      // $('#inputUserPass').val(Users[index].password);
      $('#inputUserCname').val(Users[index].name);
      $('#inputUserGender').val(Users[index].gender);
      $('#inputUserLocation').val(Users[index].location);
      $('#inputUserBio').val(Users[index].bio);

      var check;
      Users[index].isBanned ? check = true : check = false;
        $('#inputIsBanned').prop('checked', check);
      Users[index].isCheater ? check = true : check = false;
        $('#inputIsCheater').prop('checked', check)
      Users[index].isHonest ? check = true : check = false;
        $('#inputIsHonest').prop('checked', check)
      Users[index].isLocked ? check = true : check = false;
        $('#inputIsLocked').prop('checked', check)
      Users[index].isGithubCool ? check = true : check = false;
        $('#inputIsGithubCool').prop('checked', check)
      Users[index].isMigrationGrandfathered ? check = true : check = false;
        $('#inputIsMigrationGrandfathered').prop('checked', check)
      Users[index].isUniqMigrated ? check = true : check = false;
        $('#inputIsUniqMigrated').prop('checked', check)
      Users[index].isBackEndCert ? check = true : check = false;
        $('#inputIsBackEndCert').prop('checked', check)
      Users[index].isFullStackCert ? check = true : check = false;
        $('#inputIsFullStackCert').prop('checked', check)
      Users[index].emailVerified ? check = true : check = false;
        $('#inputIsEmailVerified').prop('checked', check)
      Users[index].sendMonthlyEmail ? check = true : check = false;
        $('#inputIsSendMonthlyEmail').prop('checked', check)
    }
    // show all user inputs
    $('.user-form').show();
  });

  // check/uncheck current and all children checkboxes
  $("#middle input[type=checkbox]").on('click', function() {
    var toCheck = '';
    if(($(this).prop('checked'))) {
      toCheck = 'checked';
    }
    $(this).parent().find("input[type=checkbox]").
      prop('checked', toCheck);
  });

  // check/uncheck all checkboxes with one click
  $("#globalCheck").on('click', function() {
    var toCheck = '';
    if(($(this).prop('checked'))) {
      toCheck = 'checked';
    }
    $("#middle input[type=checkbox]").prop('checked', toCheck);
  });

  // check if we're going to save a user or to ADD a user
  $('#inputUserName').on('change keyup', function() {
    var self = this;
    if($(self).val()) {
      $('#markComplete').removeClass('disabled');
      $('#deleteUser').removeClass('disabled');
      $('#markRandom').removeClass('disabled');

      $.each($('option'), function() {
        if ($(this).text() === $(self).val()) {
          $('#markComplete').text('Save user');
          return false;
        } else {
          $('#markComplete').text('Add user');
          return true;
        }
      });
    } else {
      $('#markComplete').addClass('disabled');
      $('#deleteUser').addClass('disabled');
      $('#markRandom').addClass('disabled');
    }
  });

  // fill all challenge names
  var files = $('.clickFile');
  var x = 1, ulElem = '<ul class = "collapse map-collapse no-transition ' +
    'random", style="list-style-type:none;padding-left:20px;">';
  $.each(files, function(i, File) {
    var fileTitle = $(File).text();
    var fileDirectory = $(File).parents('ul').prev('b').find('a').text();
    $.getJSON(`/files/${fileDirectory}/${fileTitle}`, (file => {
      var currFile = JSON.parse(file);
      var ul = $(ulElem);
      for (var i = 0; i < currFile.challenges.length; i++) {
        var checked = '';
        if (Users[index].completedChallenges) {
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
    }));
  });

  // remove outdated terms from the string
  function normalizeChallengeName(str) {
    var challengesRegex = /^(bonfire|waypoint|zipline|basejump|checkpoint):\s/i;
    return str.replace(challengesRegex, '');
  };

  /*
  // show challenges as button when clicking on a block
  files.on('click', function(e) {
    e.preventDefault();
    var fileTitle = $(this).text();
    var fileDirectory = $(this).parents('ul').prev('b').find('a').text();
    $.getJSON(`/files/${fileDirectory}/${fileTitle}`, (file => {
      var f = JSON.parse(file);
      var child = '<h2>' + f.name + '</h2>';
      for(var i = 0; i < f.challenges.length; i++) {
        child += '<div class="btn btn-block btn-warning">' +
          f.challenges[i].title + '</div>';
      }
      $('#right').empty();
      $('#right').append(child);
    }));
  });
  */
});