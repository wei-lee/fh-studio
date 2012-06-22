var reset_form = null;
var IDE_URL_PREFIX = "/box/srv/1.1/ide/" + DOMAIN + "/";
var RESET_URL = IDE_URL_PREFIX + "user/resetpwd";

$(document).ready(function() {
  reset_form = $('#reset_form');

  $('#reset_button').bind('click', reset);

  reset_form.validate({
    rules: {
      reset_password: 'validpass',
      reset_password_confirm: {
        validpass: true,
        equalTo: '#reset_password'
      }
    }
  });
  var resetret = function(ev) {
      if (13 === ev.which) {
        reset();
      }
      };
  reset_form.find('input[name=reset_password_confirm]').keyup(resetret);
});

function reset() {
  reset_form.find('#reset_form_error').hide();
  var reset_button = $('#reset_button');
  reset_button.attr('disabled', 'disabled').val(Lang['please_wait_text']);


  if (reset_form.valid()) {
    var reset_params = {
      token: QueryStringParser.getParameterByName('t'),
      password: reset_form.find('input[name=reset_password]').val(),
      confirm: reset_form.find('input[name=reset_password_confirm]').val()
    };

    $.ajax(RESET_URL, {
      "type": "POST",
      "contentType": "application/json",
      "data": JSON.stringify(reset_params),
      "success": function(res) {
        if ('undefined' !== typeof res.status && "error" === res.status) {
          var messageText = Lang[res.message];
          reset_form.find('#reset_form_error').show().text(messageText);
          reset_button.removeAttr('disabled').val('Reset');
        } else {
          // Redirect back to the root url and pass the message as a parameter
          document.location = "/?message=" + res.message;
        }
      },
      "error": function(jqXHR, textStatus, errorThrown) {
        // reset failed, highlight the fact/show error message
        Log.append('Reset Failed: textStatus:' + textStatus + ', errorThrown:' + errorThrown, 'ERROR');
        $('#reset_form_error').css('display', '').css('display', 'inline !important').text('Reset failed (' + jqXHR.status + ')');
        reset_button.removeAttr('disabled').val('Reset');
      }
    });
  } else {
    reset_button.removeAttr('disabled').val('Reset');
    $(reset_form.find('input.error')[0]).focus();
  }
}