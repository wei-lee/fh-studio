var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};

Apps.Configuration.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    configuration_studio_container: "#configuration_studio_container",
    configuration_embed_container: "#configuration_embed_container",
    configuration_iphone_container: "#configuration_iphone_container",
    configuration_ipad_container: "#configuration_ipad_container",
    configuration_ios_container: "#configuration_ios_container",
    configuration_android_container: "#configuration_android_container",
    configuration_blackberry_container: "#configuration_blackberry_container",
    configuration_windowsphone7_container: "#configuration_windowsphone7_container",
    configuration_nokiawrt_container: "#configuration_nokiawrt_container"
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
    // this.container = this.views.manage_publish_container;
    // $(this.container).show();
  }

});