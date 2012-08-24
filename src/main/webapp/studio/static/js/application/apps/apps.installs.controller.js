var Apps = Apps || {};

Apps.Installs = Apps.Installs || {};

Apps.Installs.Controller = Apps.Reports.Support.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    reportinginstalls_container: "#reportinginstalls_container"
  },

  container: null,

  init: function () {
    this._super();
  },

  initBindings: function () {
    this._super(this.views.reportinginstalls_container);
  },

  show: function(){
    this._super(this.views.reportinginstalls_container);
  },

  byDate: function () {
    var appid = $fw.data.get('app').guid;
    var container = $('.installs_by_date', $(this.views.reportinginstalls_container));
    this.initMetric('appinstallsdest', 'line', container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
  },

  byPlatform: function () {
    var appid = $fw.data.get('app').guid;
    var container = $('.installs_by_platform', $(this.views.reportinginstalls_container));
    this.initMetric('appinstallsdest', 'pie', container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
  },

  byLocation: function () {
    var appid = $fw.data.get('app').guid;
    var container = $('.installs_by_location', $(this.views.reportinginstalls_container));
    this.initMetric('appinstallsgeo', 'geo', container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
  }

});