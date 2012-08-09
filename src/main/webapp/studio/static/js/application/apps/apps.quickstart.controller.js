var Apps = Apps || {};

Apps.Quickstart = Apps.Quickstart || {};

Apps.Quickstart.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    // this.container = this.views.push_urbanairship_container;
    // $(this.container).show();
  }

});