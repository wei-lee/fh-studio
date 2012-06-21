(function () {
  "use strict";

  application.jqplot = application.jqplot || {};
    
  /* 
   * Draws a pie chart
   * 
   * Data format example: [['Opt1',25],['Opt2',20],['Opt3', 13]]
   * 
   */
  application.jqplot.PieChartPainter = application.jqplot.jQPlotChartPainter.extend({
    // Default options to pass to jqplot
    defaultOpts: {
      axes: {
        
      },
      seriesDefaults: {
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
          showDataLabels: true,
          sliceMargin: 4,
          startAngel: -90,
          dataLabelFormatString: '%d%%'
        }
      },
      legend: { show: true, location: 'e' },
      highlighter: {
        // highlighter doesn't work for values on a pie chart, 
        // disable rather than cause script errors
        showTooltip: false
      }
    },
    
    init: function () {
      this._super();
    }
  });

}());