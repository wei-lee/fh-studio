var Apps = Apps || {};

Apps.Editor = Apps.Editor || {};

Apps.Editor.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    editor_files_container: "#editor_files_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.editor_files_container;
    $(this.container).show();
  }

});