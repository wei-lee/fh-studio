var Apps = Apps || {};

Apps.Plugins = Apps.Plugins || {};

Apps.Plugins.Controller = Apps.Cloud.Controller.extend({

  views: {
    container: "#cloudplugins_container"
  },
  init: function () {
    this._super();
  },
  show: function(){
    $(this.views.container).empty();
    $(this.views.container).show();

    // Just shelling out the a Backbone ViewController here, skipping studio view controllers altogether
    this.view = new App.View.PluginsController();
    this.view.setElement($(this.views.container)).render();
  }
});