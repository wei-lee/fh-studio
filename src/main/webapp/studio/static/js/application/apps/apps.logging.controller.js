var Apps = Apps || {};

Apps.Logging = Apps.Logging || {};

Apps.Logging.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    debug_logging_container: "#debug_logging_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.debug_logging_container;
    $(this.container).show();
  }

});