App.View.Geo = Backbone.View.extend({
  className: 'geochart',

  initialize: function(options) {
    _.bindAll(this);
    this.options = $.extend(true, {}, this.defaultOptions, options);
    this.collection = this.options.collection;
    this.collection.bind("sync", function() {
      this.render();
    }, this);
  },

  render: function() {
    var data = google.visualization.arrayToDataTable(this.collection.toArray());
    var options = {
      width: this.options.width || "350"
    };

    if (this.collection.models.length === 0) {
      // TODO: Nicer loading template
      this.$el.html("Loading...");
      return this;
    }

    var chart = new google.visualization.GeoChart(this.el);

    chart.draw(data, options);
    return this;
  }
});