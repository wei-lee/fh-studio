App.View.Chart = Backbone.View.extend({

  LIVE_MAX_POINTS : 10,
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
        console.log("collection synced", this.collection);
        self.render();
      }, this);

      delete this.options.collection;
    } else {
      delete this.options.model;
      self.render();
    }

    if(this.options.dynamic && this.options.dynamic === true){
      if (this.collection) {
        this.collection.on('add', this.addPoint);
      }
    }

    $(window).bind('resizeEnd', function() {
      // Only resize if visible
      if ($(self.options.chart.renderTo).is(':visible')) {
        self.render(false, true);
      }
    });
  },

  resize: function() {
    var self = this;

    if (this.chart) {
      // Will resize with animation
      this.chart.setSize($(this.chart.container).width(), $(this.chart.container).height(), true);
    }
  },

  addPoint: function(model, collection, options) {
    if (!this.chart) return;
    var series = collection.getSeries();
    for(var i=0;i<series.length;i++){
      var chartSeries = this.chart.series[i];
      var obj = model.toJSON();
      var seriesname = series[i];
      if(chartSeries.data.length < this.LIVE_MAX_POINTS){
        chartSeries.addPoint({x: obj.ts, y: obj[seriesname]}, true);
      } else {
        chartSeries.addPoint({x: obj.ts, y: obj[seriesname]}, true, true);
      }
    }
    
  },

  render: function(loading, resize) {
    var self = this;

    if (loading) {
      this.$el.html(new App.View.Spinner().render().el);
      return this;
    }

    // Collection/Model might be empty
    if (!this.collection && !this.model) {
      console.error('No model or collection');
      return this;
    }

    if (!this.model && this.collection && this.collection.models.length === 0 ) {
      this.$el.html("No data available for selected date range.");
      return this;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    //To get series data, we check if the model or collection has defined a "getChartSeries" function, if it does, use that method,
    //otherwise, use the toJSON function
    // Assume model-based series
    if (this.model) {
      if(typeof this.model.getChartSeries === "function"){
        this.options.series = this.model.getSeries(this.options);
      } else {
        this.options.series = this.model.toJSON().series;
      }
    } else if (this.collection) {

      if(typeof this.collection.getChartSeries === "function"){
        this.options.series = this.collection.getChartSeries(this.options);
      } else {
        // There are two potential usages of a collection. If the collection
        // is a Series instance (as defined above), treat it as a single
        // series. Otherwise assume it is a collection of multiple series
        
        // Pie charts are "special"
        if (this.collection instanceof App.Collection.PieMetrics) {
          this.options.series = [this.collection.toJSON()];
        } else {
          this.options.series = this.collection.toJSON();
        }
      }

    } else {
      throw "Chart view needs a model or collection set.";
    }

    this.options.chart.renderTo = this.el;
    this.options.chart.reflow = false;

    // Show subtitle or not?
    // Overview areas have a hideSubtitle property to hide subtitles on charts
    if (this.collection && typeof this.collection.getSubtitle !== 'undefined' && !this.options.hideSubtitle) {
      // Use subtitle if available on collection
      this.options.subtitle = {
        text: this.collection.getSubtitle(),
        y: 40
      };
    }

    // Set width to container width (if not overridden) 
    // or on a resize event (since container already drawn)
    if (!this.options.chart.width || resize) {
      this.options.chart.width = $(this.options.chart.renderTo).width();
    }
    console.log("chart options", this.options);
    
    // Some doughnuts may need adjusting
    this.chart = new Highcharts.Chart(this.options);
    return this;
  }
});