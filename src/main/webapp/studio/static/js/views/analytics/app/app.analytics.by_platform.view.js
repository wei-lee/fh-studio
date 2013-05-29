App.View.AppAnalyticsByPlatform = App.View.PieChart.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    this.collection = new (eval(this.collection_type))([], {
      picker_model: this.options.picker_model,
      guid: this.options.guid
    });
    this.options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, this.options);
    this.collection.fetch();
  }
});