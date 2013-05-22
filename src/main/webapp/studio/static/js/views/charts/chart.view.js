App.View.Chart = Backbone.View.extend({
  initialize: function(options) {
    var self = this;

    _.bindAll(this);
    this.options = $.extend(true, {}, this.defaultOptions, options);
    this.model = this.options.model;
    this.collection = this.options.collection;

    if (this.collection) {
      this.collection.bind("sync", function() {
        self.render();
      });

      delete this.options.collection;
    } else {
      delete this.options.model;
      self.render();
    }

    $(window).unbind('resizeEnd').bind('resizeEnd', function() {
      self.resize();
    });
  },

  resize: function() {
    if (this.chart) {
      this.chart.setSize($(this.chart.container).width(), $(this.chart.container).height(), false);
    }
  },

  render: function() {
    var self = this;

    // Collection/Model might be empty
    if (!this.collection && !this.model) {
      console.log('No model or collection');
      this.$el.append("Loading...");
      return this;
    }

    if (this.collection.models.length === 0 && !this.model) {
      console.log('No collection data');
      // TODO: Nicer loading template
      this.$el.append("Loading...");
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
      // TODO: Base collection class for pie charts
      if (this.collection instanceof App.Collection.AppInstallsPlatform || this.collection instanceof App.Collection.AppStartupsPlatform || this.collection instanceof App.Collection.AppCloudRequestsPlatform || this.collection instanceof App.Collection.AppActiveUsersPlatform) {
        this.options.series = [this.collection.toJSON()];
      } else {
        this.options.series = this.collection.toJSON();
      }
    } else {
      throw "Chart view needs a model or collection set.";
    }

    this.options.chart.renderTo = this.el;

    this.chart = new Highcharts.Chart(this.options);

    // :(
    setTimeout(function() {
      self.resize();
    }, 0);
    return this;
  }
});