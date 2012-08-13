var Apps = Apps || {};

Apps.Startups = Apps.Startups || {};

Apps.Startups.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    report_startupsdest_container: "#report_startupsdest_container",
    report_startupsdate_container: "#report_startupsdate_container",
    report_startupsloc_container: "#report_startupsloc_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  reset: function () {
    // FIXME: is this necessary? carry over from $fw.app.resetApp()
    $(".appreport-results").empty();
  },

  show: function(){
    this._super();
    // TODO
    this.hide();
    // this.container = this.views.report_installsdest_container;
    // $(this.container).show();
  }

});