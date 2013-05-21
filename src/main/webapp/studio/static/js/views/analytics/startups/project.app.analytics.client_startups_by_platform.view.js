App.View.ProjectAppAnalyticsClientStartupsByPlatform = App.View.PieChart.extend({
  defaultOptions: {
    chart: {
      width: 350,
      height: 300
    },
    title: {
      text: 'Startups by Platform'
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
        return this.y + ' startups';
      }
    },
    series: []
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppStartupsPlatform();
    this.collection.fetch();
    options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, options);
  }
});