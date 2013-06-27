App.View.BarChart = App.View.Chart.extend({
  initialize: function(options) {
    options = $.extend(true, {}, {
      chart: {
        type: "bar"
      },
      credits: {
        enabled: false
      }
    }, options);

    App.View.Chart.prototype.initialize.call(this, options);
  }
});