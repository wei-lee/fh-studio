var Apps = Apps || {};

Apps.Editor = Apps.Editor || {};

Apps.Editor.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    editor_files_container: "#editor_files_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,
  showPreview: true,

  init: function () {
    
  },

  show: function(){
    this._super();
    
    this.hide();
    this.container = this.views.editor_files_container;
    $(this.container).show();
  }

});