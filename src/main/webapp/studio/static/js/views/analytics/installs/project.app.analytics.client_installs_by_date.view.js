App.View.ProjectAppAnalyticsClientInstallsByDate = App.View.LineChart.extend({
  defaultOptions: {
    total: false,
    chart: {
      width: 350,
      height: 300
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%e. %b',
        year: '%b'
      }
    },
    title: {
      text: 'Installs by Date'
    }
  },

  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new App.Collection.AppInstallsDate([], {
      total: options.total,
      picker_model: this.options.picker_model
    });
    var from = this.options.picker_model.get('from');
    var to = this.options.picker_model.get('to');
    this.collection.fetch({
      from: from,
      to: to,
      guid: options.guid
    });
    options.collection = this.collection;
    App.View.LineChart.prototype.initialize.call(this, options);
  }
});