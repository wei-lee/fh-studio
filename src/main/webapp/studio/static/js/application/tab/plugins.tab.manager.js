var Plugins = Plugins || {};
Plugins.Tab = Plugins.Tab || {};

Plugins.Tab.Manager = Tab.Manager.extend({
  
  id: 'plugins_layout',
  
  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super();
  }

});