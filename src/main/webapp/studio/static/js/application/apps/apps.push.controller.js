var Apps = Apps || {};

Apps.Push = Apps.Push || {};

Apps.Push.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    push_urbanairship_container: "#push_urbanairship_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.push_urbanairship_container;
    $(this.container).show();
  }

});