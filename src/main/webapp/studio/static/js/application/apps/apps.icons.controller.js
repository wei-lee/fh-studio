var Apps = Apps || {};

Apps.Icons = Apps.Icons || {};

Apps.Icons.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_icons_container: "#manage_icons_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.manage_icons_container;
    $(this.container).show();
  }

});