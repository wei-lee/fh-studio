App.View.DomainAnalyticsByDate = App.View.LineChart.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
    var collection_class = this.collection_type.split(".")[2];

    // Dynamic invokation - a bit blergh
    this.collection = new window["App"]["Collection"][collection_class]([], {
      total: this.options.total,
      picker_model: this.options.picker_model,
      guid: this.options.guid
    });
    this.options.collection = this.collection;
    App.View.LineChart.prototype.initialize.call(this, this.options);
    this.collection.fetch();
  }
});