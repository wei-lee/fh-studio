var Apps = Apps || {};

Apps.Export = Apps.Export || {};

Apps.Export.Controller = Apps.BuildExport.Support.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_export_container: "#manage_export_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.manage_export_container;

    this.setupAppGeneration(true);
    $(this.container).show();
  }

});