var Apps = Apps || {};

Apps.Cloudresources = Apps.Cloudresources || {};

Apps.Cloudresources.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    cloudresources_container: "#cloudresources_container"
  },

  container: null,

  init: function () {
    this._super();
  },

  show: function() {
    this._super();
    

    this.hide();
    this.container = this.views.cloudresources_container;

    $(this.container).show();
  }

});