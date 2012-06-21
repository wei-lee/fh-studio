application.jqplot = application.jqplot || {};
  
/* 
 * Draws a line graph with a date axis
 * 
 * Data format example: [["2008-09-30",4],["2008-10-30",6.5],["2008-11-30",5.7],["2008-12-30",9],["2009-01-30",8.2]]
 * 
 */
application.jqplot.LineChartPainter = application.jqplot.jQPlotChartPainter.extend({
  
  defaultOpts: {
    /*axes:{
      xaxis:{
        renderer:$.jqplot.DateAxisRenderer
      }
    },
    series:[
      {
        lineWidth:4, 
        markerOptions:{
          style:'square'
        }
      }
    ]*/
  },
  
  init: function () {
    this._super();
  }
});
