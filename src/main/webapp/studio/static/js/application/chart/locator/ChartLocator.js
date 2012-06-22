application.ChartLocator = Class.extend({
  
  charts: {},
  
  init: function () {
    
  },
  
  /*
   * Get the chart for the specified chart id
   */
  getChart: function (chartId, success, fail) {
    var chart = this.charts[chartId];
    
    if ('undefined' !== typeof chart) {
      success(chart);
    } 
    else {
      fail();
    }
  }
  
});
