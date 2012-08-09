var Apps = Apps || {};

Apps.Status = Apps.Status || {};

Apps.Status.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    status_container: "#status_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.status_container;
    $(this.container).show();
  }

});