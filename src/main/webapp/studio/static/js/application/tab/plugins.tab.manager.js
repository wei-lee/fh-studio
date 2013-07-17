var Plugins = Plugins || {};
Plugins.Tab = Plugins.Tab || {};

Plugins.Tab.Manager = Tab.Manager.extend({
  
  id: 'plugins_layout',
  views: {
    container: '#plugins_container'
  },
  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },
  show : function(){
    this._super();
    $(this.views.container).empty();
    $(this.views.container).show();

    // Just shelling out the a Backbone ViewController here, skipping studio view controllers altogether
    this.view = new App.View.PluginsController();
    this.view.setElement($(this.views.container)).render();
  }
});