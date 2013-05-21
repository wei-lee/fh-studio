App.View.ProjectAppAnalyticsClientStartupsByDate = App.View.LineChart.extend({
  defaultOptions: {
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
      text: 'Startups by Date'
    }
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppStartupsDate();
    this.collection.fetch();
    options.collection = this.collection;
    App.View.LineChart.prototype.initialize.call(this, options);
  }
});
