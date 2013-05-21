App.View.ProjectAppAnalyticsActiveUsersByPlatform = App.View.PieChart.extend({
  defaultOptions: {
    chart: {
      width: 350,
      height: 300
    },
    title: {
      text: 'Active Users by Platform'
    },
    xAxis: {
      categories: []
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      }
    },
    tooltip: {
      formatter: function() {
        return this.y + ' active users';
      }
    },
    series: []
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppActiveUsersPlatform();
    this.collection.fetch();
    options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, options);
  }
});