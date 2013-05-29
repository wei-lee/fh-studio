App.View.AppAnalyticsByDate = App.View.LineChart.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new (eval(this.collection_type))([], {
      total: this.options.total,
      picker_model: this.options.picker_model,
      guid: this.options.guid
    });
    this.options.collection = this.collection;
    App.View.LineChart.prototype.initialize.call(this, this.options);
    this.collection.fetch();
  }
});