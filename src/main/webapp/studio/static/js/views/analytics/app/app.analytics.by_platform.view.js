App.View.AppAnalyticsByPlatform = App.View.PieChart.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    var collection_class = this.collection_type.split(".")[2];

    // Dynamic invokation - a bit blergh
    this.collection = new window["App"]["Collection"][collection_class]([], {
      picker_model: this.options.picker_model,
      guid: this.options.guid
    });
    this.options.collection = this.collection;
    App.View.PieChart.prototype.initialize.call(this, this.options);
    this.collection.fetch();
  }
});