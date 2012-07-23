$(document).ready(function () {
  Log.append('main init');
  
  $('.dialog').hide();
  // Footer text
  $('#footer_year').text(new Date().getFullYear() + ' ');
  
  // show body
  $('body').show();
  
  var options = {
    applyDefaultStyles: false,
    resizable: false,
    slidable: false,
    spacing_open: 0,
    spacing_closed: 0,
    enableCursorHotkey: false
  };
  
  $.validator.addMethod("validpass", function (value, element) {
    // check the password length
    return 'string' === typeof value && value.length >= 8;
    
  }, Lang['password_valid_check']);

  // Custom validation plugin functions
  $.validator.addMethod("giturl", function(value, element) {
    var pub1, priv1, priv2;

    // git://x@x/x.git
    pub1 = /git:\/\/\S+\.git$/;
    // ssh://x@x/x.git
    priv1 = /ssh:\/\/\S+\.git$/;
    // x@x:x.git
    priv2= /^(?!ssh:\/\/|git:\/\/|http:\/\/)\S+:\S+\.git$/;

    return this.optional(element) || pub1.test(value) || (priv1.test(value) && value.split(':').length < 3) || priv2.test(value);
    
  }, Lang['scm_git_url_validate_fail']);
});
