App.View.DynamicChart = App.View.Chart.extend({
  initialize: function(options) {
    Backbone.Collection.prototype.toJSON.call(this);

    // Bind to collection or model events for knowing when to redraw the chart
    if (this.collection) {
      if (this.collection instanceof App.Collection.Series) {
        this.collection.on('add', this.addPoint);
      } else {
        this.collection.on('add', this.addSeries);
      }
    }
  },

  addPoint: function(collection, model, options) {
    if (!this.chart) return;

    var idx = collection.indexOf(model);
    this.chart.series[idx].addPoint(model.toJSON());
  },

  addSeries: function(collection, model, options) {
    if (!this.chart) return;

    this.chart.addSeries(model.toJSON());
  }
});