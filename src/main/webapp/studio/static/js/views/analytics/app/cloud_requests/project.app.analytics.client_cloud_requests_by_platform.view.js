App.View.ProjectAppAnalyticsCloudRequestsByPlatform = App.View.PieChart.extend({
  defaultOptions: {
    chart: {
      width: 350,
      height: 300
    },
    title: {
      text: 'Cloud Requests by Platform'
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
        return '<b>' + this.key + '</b> ' + this.y + ' requests - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  },

  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppCloudRequestsPlatform([], {
      picker_model: this.options.picker_model
    });
    var from = this.options.picker_model.get('from');
    var to = this.options.picker_model.get('to');
    // TODO: Pass models directly
    this.collection.fetch({
      from: from,
      to: to,
      guid: this.options.guid
    });
    this.options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, this.options);
  }
});