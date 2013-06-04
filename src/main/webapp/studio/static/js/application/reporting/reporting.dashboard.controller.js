var Reporting = Reporting || {};

Reporting.Dashboard = Reporting.Dashboard || {};

Reporting.Dashboard.Controller = Apps.Controller.extend({
  views: {
    container: '#reports_domain_container'
  },

  show: function(el) {
    $(this.views.container).empty().show();
    this.view = new App.View.DomainAnalyticsOverview();
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