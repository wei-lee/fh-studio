var Apps = Apps || {};

Apps.Cloudnotifications = Apps.Cloudnotifications || {};

Apps.Cloudnotifications.Controller = Apps.Cloud.Controller.extend({
  alert_timeout: 3000,

  models: {
    notification_email: new model.CloudNotifications()
  },

  views: {
    cloudnotifications_container: "#cloudnotifications_container"
  },

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.cloudnotifications_container);

    this.hide();

    this.initFn();
    this.showResources();
    $(this.container).show();
  },

  //TODO move this to apps.controller
  // type: error|success|info
  showAlert: function (type, message) {
    var self = this;
    var alerts_area = $(this.container).find('.alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function () {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },
  
  initBindings: function() {
    var self = this;

    var jqContainer = $(this.container);
    $fw.client.lang.insertLangFromData(jqContainer);

    $('.cloud_notification_update_button', jqContainer).bind('click', function(e) {
      e.preventDefault();
      var jqContainer = $(self.container);
      var email = $('#notification_email', jqContainer).val();
      var guid = $fw.data.get('inst').guid;
      console.log("setting email id: " + guid + ", email: " + email);
      self.models.notification_email.setEmail(guid, email, 
        function(res){
          console.log("success");
          self.showAlert("success", "Successfully updated notification email address");
        },
        function(err){
          console.log("failed to set email");
          self.showAlert("error", "Error updating notification email address");
        }
      ); 
    });
  },

  showResources: function(cb) {
    var self = this;
    var cfg = $fw.data.get('inst').config;
    var email=cfg.notification_email;

    $('#notification_email', $(this.container)).val(email);
  }
});