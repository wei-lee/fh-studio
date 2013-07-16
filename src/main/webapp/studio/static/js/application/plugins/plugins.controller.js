var Plugins = Plugins || {};

Plugins.Controller = Plugins.Controller || {};

Plugins.Controller = Apps.Controller.extend({
  views: {
    container: '#plugins_dashboard_container'
  },
  init: function() {},
  show: function(el) {
    $(this.views.container).empty();
    $(this.views.container).show();
    this.view = new App.View.PluginsDashboard();
    this.view.render();
    $(this.views.container).append(this.view.el);
  }
});