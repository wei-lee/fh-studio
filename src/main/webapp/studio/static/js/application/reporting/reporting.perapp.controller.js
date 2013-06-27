var Reporting = Reporting || {};

Reporting.Perapp = Reporting.Perapp || {};

Reporting.Perapp.Controller = Apps.Controller.extend({
  views: {
    container: '#reports_per_app_container'
  },

  show: function(el) {
    $(this.views.container).empty().show();
    this.view = new App.View.PerAppAnalytics();
    this.view.render();
    $(this.views.container).append(this.view.el);
  },

  hide: function() {
    $(this.views.container).empty().hide();
    if (this.view) {
      this.view.undelegateEvents();
      this.view.remove();
    }
  }
});