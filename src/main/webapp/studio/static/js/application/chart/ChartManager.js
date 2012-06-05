(function () {
  "use strict";
  
  application.ChartManager = Class.extend({
    // painter package to use
    painter: 'jqplot',
    chartLocators: {},
    
    init: function () {
      var self = this;
      
      self.chartLocators.metrics = new application.MetricsChartLocator();
      self.sampledataEnabled = 'true' === $fw.getClientProp('reporting-sampledata-enabled');
    },
    
    /*
     * Insert the specified chart into the given container.
     * chartOpts are optional and override the default chart options for the specified chart
     */
    insert: function (chartLocator, chartType, chartOpts, params, container, url, callback) {
      var self = this, opts, dataLocator, painter;

      // Get the chart definition first
      self.chartLocators[chartLocator].getChart(chartType, function (chart) {
        Log.append('inserting chart:' + chartType + ' >> ' + typeof chart);
        
        // Overwrite options with any passed in
        opts = chartOpts ? $.extend(true, {}, chart.opts, chartOpts) : chart.opts;
        Log.append('default    chartOpts:' + JSON.stringify(chart.opts));
        Log.append('overridden chartOpts:' + JSON.stringify(opts));
        
        // Resolve data locator using chart options value for dataLoc
        dataLocator = new application[js_util.capitalise(chart.dataLoc) + 'DataLocator'](self.sampledataEnabled);
        dataLocator.getData(params, chartType, url, function (res) {
          
          // get the labels from res if there are any
          if (res.labels) {
            opts.labels = res.labels;
            res = res.data;
          }
          
          if (res.length > 0) {
  
            // Create a new div inside the container
            var chartDiv = $('<div>', {
              'id': container.attr('id') + '_chart_' + chartType + '_' + chart.type
            });
            container.empty().html(chartDiv);
            
            // Resolve the painter to use using chart options value for the chart type
            painter = new application[self.painter][js_util.capitalise(chart.type) + 'ChartPainter']();

            opts.draw_with = 'highcharts';
            opts.chart_type = chart.type;

            // Draw the chart
            painter.draw(res, chartDiv, opts, callback);        
          } else {
            container.text($fw.client.lang.getLangString('metrics_no_results'));
            callback({ message: $fw.client.lang.getLangString('metrics_no_results'), code: 'noresults' });
          }
        }, function (res) {
          // failed to locate chart data
          $fw.client.dialog.error(res);
          Log.append('getData failed for params: ' + res + ' :: ' + JSON.stringify(params));
        });
      }, function (res) {
        Log.append('getChart failed for chart: ' + chartType + ' :: ' + res, 'ERROR');
      });
    }
  });
}());