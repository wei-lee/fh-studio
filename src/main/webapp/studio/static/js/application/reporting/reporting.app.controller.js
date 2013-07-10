var Reporting = Reporting || {};

Reporting.Controller = Reporting.Controller || {};
Reporting.App = Reporting.App || {};
Reporting.App.Controller = Apps.Controller.extend({
  views: {
    container: '#reports_in_app_container'
  },

  show: function(el) {
    $(this.views.container).empty().show();
    this.view = new App.View.ProjectAppAnalyticsController();
    this.view.render();
    $(this.views.container).append(this.view.el);
  },

  hide: function (){
    if (this.view) {
      this.view.undelegateEvents();
      this.view.remove();
    }
  } 
});