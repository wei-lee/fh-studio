var Apps = Apps || {};

Apps.Details = Apps.Details || {};

Apps.Details.Controller = Controller.extend({

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
    console.log('app details show');
  },

  hide: function(){
    $.each(this.views, function(k, v){
      $(v).hide();
    });
  }

});