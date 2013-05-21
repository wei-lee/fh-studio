App.View.LineChart = App.View.Chart.extend({
  initialize: function(options) {
    options = $.extend(true, {}, {
      chart: {
        type: "line"
      },
      credits: {
        enabled: false
      }
    }, options);

    App.View.Chart.prototype.initialize.call(this, options);
  }
});