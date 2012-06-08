var activate_form = null;
var IDE_URL_PREFIX = "/box/srv/1.1/ide/" + DOMAIN + "/";
var ACTIVATE_URL = IDE_URL_PREFIX + "user/activate";

$(document).ready( function () {
  activate_form = $('#activate_form');
  
  $('#activate_button').bind('click', activate);
  
  activate_form.validate({
    rules: {
      activate_password: 'validpass',
      activate_password_confirm: {
        validpass: true,
        equalTo: '#activate_password'
      }
    }
  });
  var activateret = function( ev ) {
    if( 13 === ev.which ) {
      activate();
    }
  };
  activate_form.find('input[name=activate_password_confirm]').keyup( activateret );
});

function activate() {
  activate_form.find('#activate_form_error').hide();
  var activate_button = $('#activate_button');
  activate_button.attr('disabled', 'disabled').val(Lang['please_wait_text']);
  
  if (activate_form.valid()) {
    var activate_params = {
      token: TOKEN,
      password: activate_form.find('input[name=activate_password]').val(),
      confirm: activate_form.find('input[name=activate_password_confirm]').val()
    };
    $.ajax(ACTIVATE_URL, {
      "type": "POST",
      "contentType": "application/json",
      "data": JSON.stringify(activate_params),
      "success": function (res) {
        if ('undefined' !== typeof res.status && "error" === res.status) {
          var messageText = Lang[res.message];
          activate_form.find('#activate_form_error').show().text(messageText);
          activate_button.removeAttr('disabled').val('Activate');
        }
        else {
          document.location = "/?message=" + res.message;
        }
      },
      "error": function (jqXHR, textStatus, errorThrown) {
        // activate failed, highlight the fact/show error message
        Log.append('Activate Failed: textStatus:' + textStatus + ', errorThrown:' + errorThrown , 'ERROR');
        $('#activate_form_error').css('display','').css('display','inline !important').text('Activate failed (' + jqXHR.status + ')');
        activate_button.removeAttr('disabled').val('Activate'); 
      }
    });
  }
  else {
    activate_button.removeAttr('disabled').val('Activate');
    $(activate_form.find('input.error')[0]).focus();
  }
}