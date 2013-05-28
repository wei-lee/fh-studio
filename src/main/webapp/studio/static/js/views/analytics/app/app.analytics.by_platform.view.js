App.View.AppAnalyticsByPlatform = App.View.PieChart.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new this.collection_type([], {
      picker_model: this.options.picker_model,
      guid: this.options.guid
    });
    this.collection.fetch();
    this.options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, this.options);
  }
});