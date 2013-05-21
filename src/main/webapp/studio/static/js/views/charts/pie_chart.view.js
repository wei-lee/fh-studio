App.View.PieChart = App.View.Chart.extend({
  initialize: function(options) {
    options = $.extend(true, {}, {
      chart: {
        type: "pie"
      },
      credits: {
        enabled: false
      },
      tooltip: {
        hideDelay: 50
      }
    }, options);

    App.View.Chart.prototype.initialize.call(this, options);
  }
});