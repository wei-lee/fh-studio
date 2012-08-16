var Apps = Apps || {};

Apps.Startups = Apps.Startups || {};

Apps.Startups.Controller = Apps.Reports.Support.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    reportingstartups_container: "#reportingstartups_container"
  },

  container: null,

  init: function () {
    this._super();
  },

  initBindings: function () {
    this._super(this.views.reportingstartups_container);
  },

  show: function(){
    this._super(this.views.reportingstartups_container);
  },

  byDate: function () {
    var appid = $fw.data.get('app').guid;
    var container = $('#startups_by_date');
    this.initMetric('appstartupsdest', 'line', container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
  },

  byPlatform: function () {
    var appid = $fw.data.get('app').guid;
    var container = $('#startups_by_platform');
    this.initMetric('appstartupsdest', 'pie', container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
  },

  byLocation: function () {
    var appid = $fw.data.get('app').guid;
    var container = $('#startups_by_location');
    this.initMetric('appstartupsgeo', 'geo', container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
  }

});