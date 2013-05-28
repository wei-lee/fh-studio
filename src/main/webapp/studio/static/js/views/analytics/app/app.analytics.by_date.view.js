App.View.AppAnalyticsByDate = App.View.LineChart.extend({
  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new this.collection_type([], {
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