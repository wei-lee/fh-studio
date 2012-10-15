var Apps = Apps || {};

Apps.Export = Apps.Export || {};

Apps.Export.Controller = Apps.BuildExport.Support.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_export_container: "#manage_export_container"
  },

  container: null,
  showPreview: true,

  init: function () {
    
  },

  show: function(){
    this._super();
    
    this.hide();
    this.container = this.views.manage_export_container;

    this.setupAppGeneration(true);
    $(this.container).show();
  }

});