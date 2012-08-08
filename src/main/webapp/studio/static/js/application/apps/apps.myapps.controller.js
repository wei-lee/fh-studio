var Apps = Apps || {};

Apps.Myapps = Apps.Myapps || {};

Apps.Myapps.Controller = Controller.extend({

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
    console.log('myapps show');
  },

  hide: function(){
    $.each(this.views, function(k, v){
      $(v).hide();
    });
  }

});