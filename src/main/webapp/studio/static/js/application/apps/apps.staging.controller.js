var Apps = Apps || {};

Apps.Staging = Apps.Staging || {};

Apps.Staging.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    staging_container: "#staging_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.staging_container;
    $(this.container).show();
  }

});