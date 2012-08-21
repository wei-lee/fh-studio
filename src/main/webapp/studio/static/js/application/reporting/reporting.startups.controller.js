var Reporting = Reporting || {};

Reporting.Startups = Reporting.Startups || {};

Reporting.Startups.Controller = Apps.Reports.Support.extend({

  models: {
  },

  views: {
    reportingtabstartups_container: '#reportingtabstartups_container'
  },

  container: null,

  init: function () {
    this._super();
  },

  initBindings: function () {
    this._super(this.views.reportingtabstartups_container);
  },

  show: function(){
    this._super(this.views.reportingtabstartups_container);
  },

  byDate: function () {
    var container = $('.startups_by_date', $(this.views.reportingtabstartups_container));
    this.initMetric('appstartupsdest', 'line', container, Constants.GET_SINGLE_APP_METRICS_URL);
  },

  byPlatform: function () {
    var container = $('.startups_by_platform', $(this.views.reportingtabstartups_container));
    this.initMetric('appstartupsdest', 'pie', container, Constants.GET_SINGLE_APP_METRICS_URL);
  },

  byLocation: function () {
    var container = $('.startups_by_location', $(this.views.reportingtabstartups_container));
    this.initMetric('appstartupsgeo', 'geo', container, Constants.GET_SINGLE_APP_METRICS_URL);
  }
});

