application.ReportManager = Class.extend({
  
  init: function () {
  
  },
  
  show: function (metric, type, id, container) {
    var appid = $fw.data.get('app').guid;
    
    if ('undefined' === typeof $fw.client.reporting) {
      $fw.client.reporting = new application.ReportingManager();
    }
    
    $fw.client.reporting.init();
    $fw.client.reporting.initMetric(metric, type, container, Constants.GET_SINGLE_APP_METRICS_URL, appid);
    console.log("Called initMetric for appid: " + appid + ", metric: " + metric + ", chart type: " + type);
  }
  
});