var Apps = Apps || {};

Apps.Cloudnotifications = Apps.Cloudnotifications || {};


// Notes:
// 
// This controller only exists to proxy Backbone view creation (since 
// giving the current Studio a router would take an age). Existing
// methods have likely moved to other subviews.

Apps.Cloudnotifications.Controller = Apps.Cloud.Controller.extend({

  views: {
    cloudnotifications_container: "#cloudnotifications_container",
    systemlog_container: "#cloud_notifications_pill",
    event_alerts_container: "#event_alerts_container",
    alerts_notification_container: "#alerts_notifications_container",
    helper_text_container: "#cloud_notifications_helper_text"
  },

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function(){
    var container = $(this.views.cloudnotifications_container);
    var self = this;
    $('a[data-toggle="pill"]', container).each(function(el){
       var params = {
         trigger:"hover",
         placement:"bottom"
       };
      var title = "";
      if($(this).data("type").toLowerCase() === "cloud_notifications"){
        title = $fw.client.lang.getLangString("system_logs_helper_text");
      } else if($(this).data("type").toLowerCase() === "alerts") {
        title = $fw.client.lang.getLangString("alerts_helper_text");
      } else {
        title = $fw.client.lang.getLangString("notifications_helper_text");
      }
      params.title = title;
      $(this).tooltip(params);
    });
    $('a[data-toggle="pill"]', container).on('shown', function(e){
      $('.pill-pane', container).hide();
      var dataType = $(e.target).data("type");
      var paneId = $(e.target).attr("href");
      console.log("data type is " + dataType + "paneId is " + paneId );
      $(paneId, container).show();
      if(dataType.toLowerCase() === "cloud_notifications"){
        self.renderSystemlogs();
      } else if(dataType.toLowerCase() === "alerts"){
        self.renderAlerts();
      } else {
        self.renderAlertNotifications();
      }
    });

  },

  show: function() {
    this.initFn();
    var container = $(this.views.cloudnotifications_container);
    container.show();
    this._super(this.views.cloudnotifications_container);
    var selected = $('li.active', container);
    if(selected.length > 0){
      selected.removeClass('active').find("a[data-toggle='pill']").trigger("click");
    } else {
      $("a[data-toggle='pill']:first", container).trigger("click");
    }
  },

  renderSystemlogs : function(){

    if(!this.view){
      this.view = new App.View.CloudNotifications({
        el: this.views.systemlog_container,
        collection: App.collections.cloud_events
      });
    } else {
      this.view.reload();
    }

  },

  renderAlerts: function(){

    if(!this.alertsView){
      this.alertsView = new App.View.EventAlerts({
        el: this.views.event_alerts_container,
        collection: App.collections.event_alerts,
        alertFilter: App.models.alertFilters,
        sysEvents: App.collections.cloud_events
      });
    } else {
      this.alertsView.reload();
    }
  },

  renderAlertNotifications: function(){
    if(!this.alertNotificationView){
      this.alertNotificationView = new App.View.EventAlertNotifications({
        el: this.views.alerts_notification_container,
        collection: App.collections.alerts_notifications
      });
    } else {
      this.alertNotificationView.reload();
    }
  }

});