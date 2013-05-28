App.View.AppAnalyticsByPlatform = App.View.PieChart.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new this.collection_type([], {
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