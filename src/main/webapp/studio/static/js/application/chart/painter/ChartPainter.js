application.ChartPainter = Class.extend({
  init: function () {
    
  },
  
  /*
   * Draw a chart representing the specified data, and place it in the given container
   */
  draw: function (data, container, opts, callback) {
    Log.append('draw not implemented for subclass of ChartPainter');
  }
});
