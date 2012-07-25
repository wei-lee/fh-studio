var center_layout, login_form, register_form, forgot_form = null;
var LOGIN_URL = "/box/srv/1.1/act/sys/auth/login";
var IDE_URL_PREFIX = "/box/srv/1.1/ide/" + DOMAIN + "/";
var REGISTER_URL = IDE_URL_PREFIX + "user/register";
var FORGOT_URL = IDE_URL_PREFIX + "user/forgotpwd";
var INDEX_URL = "index.html";

$(document).ready(init);

function init() {
  if ('undefined' !== typeof INFO_MESSAGE && INFO_MESSAGE.length > 0) {
    var msg = Lang[INFO_MESSAGE] || null;
    if (msg !== null) {
      $('#info_area p').text(msg).parent().show();
    }
  }

  var doJQLayout = true;
  if (typeof skipjQueryLayout != 'undefined') {   
    if( skipjQueryLayout === true ) {
      doJQLayout = false;
    }
  }

  if( doJQLayout === true ) {
    setupLayout();
  }
  setupLoginForm();
  setupRegisterForm();
  setupForgotForm();
  
  // if( doJQLayout === true ) {
  //   center_layout.resizeAll();
  // }
}

function setupLayout() {
  
  var options = {
    applyDefaultStyles: false,
    resizable: false,
    slidable: false,
    spacing_open: 0,
    spacing_closed: 0,
    enableCursorHotkey: false
  };

  // Set text below login area if required
  var loginFooterText = $fw.getClientProp('login-footer-text');
  if (('undefined' !== typeof loginFooterText) && (loginFooterText.length > 0)) {
    Log.append('setting login footer text:' + loginFooterText);
    // Set text as html here in case there are links
    $('.login-footer-text').html(loginFooterText).parent().show();
  }
}

function setupLoginForm() {
  login_form = $('#login_form');

  // setup forgot password link
  var forgotLink = $fw.getClientProp('forgot-pw-url');
  if ('undefined' !== typeof forgotLink && forgotLink.length > 0) {
    // we have a forgot password link, open it
    $('p.forgot-password a').bind('click', function () {
      window.location.href = forgotLink;
    });
  } else {
    // show forgot password form
    $('p.forgot-password a').bind('click', showForgotForm);
  }
  
  $('#login_button').bind('click', login);
  login_form.validate({
    rules: {
      u: 'required',
      p: 'required'
    }
  });
  var loginret = function( ev ) {
    if( 13 === ev.which ) {
      login();
    }
  };
  login_form.find('input[name=p]').keyup( loginret );
}

function showLoginForm() {
  forgot_form.hide();
  login_form.show();
}

function setupRegisterForm() {
  register_form = $('#register_form');
  
  clearRegisterForm();
  
  $('#register_button').bind('click', register);
  register_form.validate({
    rules: {
      register_name: 'required',
      register_email: {
        required: true,
        email: true
      },
      register_password: 'validpass',
      register_confirm: {
        validpass: true,
        equalTo: '#register_password'
      }
    }
  });
}

function clearRegisterForm() {
  //Clear all fields
  register_form.find('input[type=text],input[type=password]').val('');
}

function setupForgotForm() {
  forgot_form = $('#forgot_form').hide();
    
  forgot_form.find('#login_back_link').bind('click', showLoginForm);
    
  $('#forgot_button').bind('click', forgot);
  forgot_form.validate({
    rules: {
      forgot_email: {
        required: true,
        email: true
      }
    }
  });
}

function clearForgotForm() {
  //Clear all fields
  forgot_form.find('input[type=text],input[type=password]').val('');
}

function login() {
  var loginButton = $('#login_button');
  
  loginButton.attr('disabled', 'disabled').val(Lang['please_wait_text']);
  
  $('#login_form_error').css('display', 'none !important');
  if (login_form.valid()) {
    var login_params = {
      u: login_form.find('input[name=u]').val(),
      p: login_form.find('input[name=p]').val(),
      d: login_form.find('input[name=d]').val()
    };
    $.ajax(LOGIN_URL, {
      "type": "POST",
      "contentType": "application/json",
      "data": JSON.stringify(login_params),
      "success": function (res) {
        if ('undefined' !== typeof res.result && "fail" === res.result) {
          // login failed, highlight the fact/show error message
          $('#login_form_error').css('display','inline !important').text('Login failed. Please try again.');
          loginButton.removeAttr('disabled').val('Login');
        }
        else {
          $.cookie('__fw_user_id__', res.user);
          if(res.redirect){
              document.location = res.redirect;
          } else {
            // Reload the page to the current host (without the urn part)
            document.location = document.location.protocol + '//' + document.location.host;
          }
        }
      },
      "error": function (jqXHR, textStatus, errorThrown) {
        // login failed, highlight the fact/show error message
        Log.append('Login Failed: textStatus:' + textStatus + ', errorThrown:' + errorThrown , 'ERROR');
        $('#login_form_error').css('display','inline !important').text('Login failed (' + jqXHR.status + ')');
        loginButton.removeAttr('disabled').val('Login');
      }
    });
  }
  else {
    loginButton.removeAttr('disabled').val('Login');
    $(login_form.find('input.error')[0]).focus();
  }
}

function register() {
  var registerButton = $('#register_button');

  registerButton.attr('disabled', 'disabled').val(Lang['please_wait_text']);
  
  if (register_form.valid()) {
    // send register request
    var register_params = {
      name: register_form.find('input[name=register_name]').val(),
      email: register_form.find('input[name=register_email]').val(),
      password: register_form.find('input[name=register_password]').val(),
      confirm: register_form.find('input[name=register_confirm]').val()
    };
    var domain = register_form.find('input[name=register_domain]').val();
    
    $.ajax(REGISTER_URL, {
      "type": "POST",
      "data": JSON.stringify(register_params),
      "success": function (res) {
        var messageText;
        if ('undefined' !== typeof res.status && "error" === res.status) {
          // alert/warn errors if register fail
          messageText = getMessageText(res.message);
          register_form.find('#register_form_error').show().text('Registration Failed: ' + messageText);
          registerButton.removeAttr('disabled').val('Register');
        }
        else {
          clearRegisterForm();
          messageText = getMessageText(res.message);          
          $('#info_area p').text(messageText).parent().show();
          registerButton.val('Registered');
        }
      },
      "error": function (jqXHR, textStatus, errorThrown) {
        Log.append('Registration Failed: textStatus:' + textStatus + ', errorThrown:' + errorThrown , 'ERROR');
        register_form.find('#register_form_error').show().text('Registration Failed (' + jqXHR.status + ")");
        registerButton.removeAttr('disabled').val('Register');
      }
    });
  }
  else {
    registerButton.removeAttr('disabled').val('Register');
    $(register_form.find('input.error')[0]).focus();
  }
}

function showForgotForm() {
  login_form.hide();
  forgot_form.show();
}

function forgot() {
  if (forgot_form.valid()) {
    // send register request
    var forgot_params = {
      email: forgot_form.find('input[name=forgot_email]').val()
    };
    
    $.post(FORGOT_URL, JSON.stringify(forgot_params) , function (res) {
      var messageText;
      clearForgotForm();
      messageText = Lang['pwd_reminder_sent'];
      $('#info_area p').text(messageText).parent().show();
    });
  }
}

function getMessageText(msgCode) {
  var res = Lang[msgCode];
  if( typeof res === 'undefined' ) {
    // Fall back to the message text code if no lang value found
    res = msgCode;
  }
  
  return res;
}