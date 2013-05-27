$(document).ready(function() {
  console.log('main init');

  $('.dialog').hide();
  // Footer text
  $('#footer_year').text(new Date().getFullYear() + ' ');

  // show body
  $('body').show();

  $.validator.addMethod("validpass", function(value, element) {
    // check the password length
    return 'string' === typeof value && value.length >= 8;

  }, Lang['password_valid_check']);

  // Handy event emitter for a "resizeEnd" event
  // fired after a resize has finished
  $(window).resize(function() {
    if (this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
      $(this).trigger('resizeEnd');
    }, 250);
  });
  
  // Custom validation plugin functions
  $.validator.addMethod("giturl", function(value, element) {
    var pub1, priv1, priv2;

    // git://x@x/x.git
    pub1 = /git:\/\/\S+\.git$/;
    // ssh://x@x/x.git
    priv1 = /ssh:\/\/\S+\.git$/;
    // x@x:x.git
    priv2 = /^(?!ssh:\/\/|git:\/\/|http:\/\/)\S+:\S+\.git$/;

    return this.optional(element) || pub1.test(value) || (priv1.test(value) && value.split(':').length < 3) || priv2.test(value);

  }, Lang['scm_git_url_validate_fail']);
});