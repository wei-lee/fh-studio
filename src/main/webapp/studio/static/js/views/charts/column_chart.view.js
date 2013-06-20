App.View.ColumnChart = App.View.Chart.extend({
  initialize: function(options) {
    options = $.extend(true, {}, {
      chart: {
        type: "column"
      },
      credits: {
        enabled: false
      }
    }, options);

    App.View.Chart.prototype.initialize.call(this, options);
  }
});