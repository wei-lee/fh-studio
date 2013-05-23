App.View.ProjectAppAnalyticsClientInstallsByPlatform = App.View.PieChart.extend({
  defaultOptions: {
    chart: {
      width: 350,
      height: 300
    },
    title: {
      text: 'Installs by Platform'
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
        return this.y + ' installs';
      }
    },
    series: []
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppInstallsPlatform();
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