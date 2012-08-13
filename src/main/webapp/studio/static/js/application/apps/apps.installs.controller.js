var Apps = Apps || {};

Apps.Installs = Apps.Installs || {};

Apps.Installs.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    report_installsdest_container: "#report_installsdest_container",
    report_installsdate_container: "#report_installsdate_container",
    report_installsloc_container: "#report_installsloc_container"
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

    // FIXME: is this necessary? carry over from $fw.app.resetApp()
    $(".appreport-results").empty();
    
    this.hide();

    // this.container = this.views.report_installsdest_container;
    // $(this.container).show();
  }

});