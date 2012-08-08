var Apps = Apps || {};

Apps.Templates = Apps.Templates || {};

Apps.Templates.Controller = Controller.extend({

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
  },

  hide: function(){
    $.each(this.views, function(k, v){
      $(v).hide();
    });
  }

});