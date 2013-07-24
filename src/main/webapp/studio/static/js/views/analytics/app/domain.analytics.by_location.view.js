App.View.DomainAnalyticsByLocation = Backbone.View.extend({
  defaultOptions: {
    fullscreen: false
  },

  initialize: function(options) {
    var self = this;
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};

    var collection_class = this.collection_type.split(".")[2];

    // Dynamic invokation - a bit blergh
    this.collection = new window["App"]["Collection"][collection_class]([], {
      guid: options.guid,
      picker_model: options.picker_model
    });
    this.collection.bind("beforeFetch", function() {
      this.render(true);
    }, this);
    this.collection.bind("sync", function() {
      this.render();
    }, this);
    this.collection.fetch();

    $(window).bind('resizeEnd', function() {
      // Only resize if visible
      if ($(self.$el).is(':visible')) {
        self.render(false);
      }
    });
  },

  render: function(loading) {
    if (loading) {
      this.$el.html(new App.View.Spinner().render().el);
      return this;
    }

    var html = $(this.template).html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$geochart = this.$el.find('.geo_chart_container');
    this.$title = this.$el.find('.by_location');

    if (this.collection.models.length === 0) {
      this.$title.hide();
    } else {
      this.$title.show();
      this.$title.text(this.title);
    }

    // Resize "fullscreen" geocharts to be bigger
    // Although don't expand them to their container size, since these 
    // charts are very vertically long
    if (this.options.fullscreen) {
      this.$geochart.css({width: 600, margin: "0 auto"});
    }

    this.$geochart.html(new App.View.Geo({
      collection: this.collection,
      width: this.$geochart.width()
    }).render().$el);
    return this;
  }
});