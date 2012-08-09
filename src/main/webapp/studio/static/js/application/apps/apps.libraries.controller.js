var Apps = Apps || {};

Apps.Libraries = Apps.Libraries || {};

Apps.Libraries.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_frameworks_container: "#manage_frameworks_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.manage_frameworks_container;
    $(this.container).show();
  }

});