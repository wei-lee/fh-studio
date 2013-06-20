var Reporting = Reporting || {};

Reporting.Controller = Reporting.Controller || {};

Reporting.Controller = Apps.Controller.extend({
  init: function() {},

  show: function(el) {
    $(this.views.container).empty();
    $(this.views.container).show();
    this.view = new App.View.ProjectAppAnalyticsController();
    this.view.render();
    $(this.views.container).append(this.view.el);
  }
});