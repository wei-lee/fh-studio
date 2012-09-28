var Apps = Apps || {};

Apps.Build = Apps.Build || {};

Apps.Build.Controller = Apps.BuildExport.Support.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_publish_container: "#manage_publish_container"
  },

  container: null,
  showPreview: true,

  init: function () {
    
  },

  show: function(){
    this._super();
    
    this.hide();
    this.container = this.views.manage_publish_container;
    this.setupAppGeneration(false);
    
    $(this.container).show();
  }

});