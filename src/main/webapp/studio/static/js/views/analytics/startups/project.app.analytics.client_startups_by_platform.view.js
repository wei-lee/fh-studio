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
        return '<b>' + this.key + '</b> ' + this.y + ' startups - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppStartupsPlatform();
    var from = App.views.picker.currentFrom();
    var to = App.views.picker.currentTo();
    this.collection.fetch({
      from: from,
      to: to,
      guid: options.guid
    });
    options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, options);
  }
});