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

  // Emit a beforeFetch event, prior to fetching on a collection
  (function() {
    if ('undefined' !== typeof Backbone) { // backbone may not be loaded for some pages e.g. login/reset/activate
      var fetch = Backbone.Collection.prototype.fetch;
      Backbone.Collection.prototype.fetch = function() {
        this.trigger('beforeFetch');
        return fetch.apply(this, arguments);
      };
    }
  })();

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

  // Studio version switching
  $('#switch_studio').click(function() {
    var data = {
      payload: {
        key: "studio.version",
        value: "beta"
      }
    };
    data['payload']["csrftoken"] =  $('input[name="csrftoken"]').val();

    $.ajax({
      type: 'POST',
      url: '/box/srv/1.1/ide/' + Constants.DOMAIN + '/user/setProp',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'text/plain',
      timeout: 20000,
      success: function(res) {
        console.log('successfully set studio version');
        document.location = '/';
      },
      error: function(xhr, status) {
        console.log('error saving user preference');
      }
    });
  });

  function addFHHeaders(xhr, settings){
    var csrfToken = $('input[name="csrftoken"]').val();
    if(csrfToken && csrfToken.length > 0){
      xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    }
  }

  $.ajaxSetup({
    beforeSend: function (xhr, settings) {
      if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
        //Local request, add FH headers!
        addFHHeaders(xhr, settings);
      }
    }
  });
});