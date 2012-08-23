var Reporting = Reporting || {};

Reporting.Installs = Reporting.Installs || {};

Reporting.Installs.Controller = Apps.Reports.Support.extend({

  models: {
  },

  views: {
    reportingtabinstalls_container: '#reportingtabinstalls_container'
  },

  container: null,

  init: function () {
    this._super();
  },

  initBindings: function () {
    this._super(this.views.reportingtabinstalls_container);
  },

  show: function(){
    this._super(this.views.reportingtabinstalls_container);
  },

  byDate: function () {
    // appid is got from dropdown, so no need to pas it on to initMetric
    var container = $('.installs_by_date', $(this.views.reportingtabinstalls_container));
    this.initMetric('appinstallsdest', 'line', container, Constants.READ_APP_METRICS_URL);
  },

  byPlatform: function () {
    var container = $('.installs_by_platform', $(this.views.reportingtabinstalls_container));
    this.initMetric('appinstallsdest', 'pie', container, Constants.READ_APP_METRICS_URL);
  },

  byLocation: function () {
    var container = $('.installs_by_location', $(this.views.reportingtabinstalls_container));
    this.initMetric('appinstallsgeo', 'geo', container, Constants.READ_APP_METRICS_URL);
  }
});

