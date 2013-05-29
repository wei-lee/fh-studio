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
    if (this.chart) {
      this.chart.setSize($(this.chart.container).width(), $(this.chart.container).height(), true);
    }
  },

  render: function(loading) {
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
      // TODO: Base collection class for pie charts
      if (this.collection instanceof App.Collection.AppInstallsPlatform 
        || this.collection instanceof App.Collection.AppStartupsPlatform 
        || this.collection instanceof App.Collection.AppCloudRequestsPlatform 
        || this.collection instanceof App.Collection.AppActiveUsersPlatform 
        || this.collection instanceof App.Collection.DomainInstallsPlatform
        || this.collection instanceof App.Collection.DomainStartupsPlatform
        || this.collection instanceof App.Collection.DomainCloudRequestsPlatform) {
        this.options.series = [this.collection.toJSON()];
      } else {
        console.log('If your chart is not showing, check here and add collection type.');
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