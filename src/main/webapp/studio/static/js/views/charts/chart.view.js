App.View.Chart = Backbone.View.extend({
  initialize: function(options) {
    var self = this;

    _.bindAll(this);
    this.options = $.extend(true, {}, this.defaultOptions, options);
    this.model = this.options.model;
    this.collection = this.options.collection;

    if (this.collection) {
      this.collection.on('beforeFetch', function() {
        self.render(true);
      }, this);

      this.collection.bind("sync", function() {
        self.render();
      }, this);

      delete this.options.collection;
    } else {
      delete this.options.model;
      self.render();
    }

    $(window).bind('resizeEnd', function() {
      self.resize();
    });
  },

  resize: function() {
    var self = this;

    if (this.chart) {
      // Will resize with animation
      this.chart.setSize($(this.chart.container).width(), $(this.chart.container).height(), true);
    }
  },

  render: function(loading) {
    var self = this;

    if (loading) {
      this.$el.html(new App.View.Spinner().render().el);
      return this;
    }

    var self = this;

    // Collection/Model might be empty
    if (!this.collection && !this.model) {
      console.log('No model or collection');
      this.$el.html("No model/collection set.");
      return this;
    }

    if (this.collection.models.length === 0 && !this.model) {
      this.$el.html("No data available for selected date range.");
      return this;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    // Assume model-based series
    if (this.model) {
      this.options.series = this.model.toJSON().series;
    } else if (this.collection) {
      // There are two potential usages of a collection. If the collection
      // is a Series instance (as defined above), treat it as a single
      // series. Otherwise assume it is a collection of multiple series

      // Pie charts are "special"
      if (this.collection instanceof App.Collection.PieMetrics) {
        this.options.series = [this.collection.toJSON()];
      } else {
        this.options.series = this.collection.toJSON();
      }
    } else {
      throw "Chart view needs a model or collection set.";
    }

    this.options.chart.renderTo = this.el;
    this.options.chart.reflow = false;

    // Show subtitle or not?
    // Overview areas have a hideSubtitle property to hide subtitles on charts
    if (typeof this.collection.getSubtitle !== 'undefined' && !this.options.hideSubtitle) {
      // Use subtitle if available on collection
      this.options.subtitle = {
        text: this.collection.getSubtitle(),
        y: 40
      };
    }

    // Some doughnuts may need adjusting

    this.chart = new Highcharts.Chart(this.options);
    return this;
  }
});