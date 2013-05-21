App.View.ProjectAppAnalyticsCloudRequestsByDate = App.View.LineChart.extend({
  defaultOptions: {
    total: false,
    chart: {
      width: 350,
      height: 300
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        month: '%e. %b',
        year: '%b'
      }
    },
    title: {
      text: 'Cloud Requests by Date'
    }
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppCloudRequestsDate({
      total: options.total
    });
    this.collection.fetch();
    options.collection = this.collection;
    App.View.LineChart.prototype.initialize.call(this, options);
  }
});