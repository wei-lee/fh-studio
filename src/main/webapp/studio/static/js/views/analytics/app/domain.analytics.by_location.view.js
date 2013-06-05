App.View.DomainAnalyticsByLocation = Backbone.View.extend({
  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};

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

    if (this.$el.width() > 500) {
      // Full screen container, resize to 600
      this.$geochart.width('750');
      this.$geochart.css({margin: '0 auto'});
    }

    this.$geochart.html(new App.View.Geo({
      collection: this.collection,
      width: this.$geochart.width()
    }).render().$el);

    return this;
  }
});