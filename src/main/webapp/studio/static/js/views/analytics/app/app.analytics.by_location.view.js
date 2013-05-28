App.View.AppAnalyticsByLocation = Backbone.View.extend({
  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    if (options) {
      this.width = options.width || 350;
    } else {
      this.width = 350;
    }

    this.collection = new this.collection_type([], {
      guid: options.guid,
      picker_model: options.picker_model
    });
    var from = options.picker_model.get('from');
    var to = options.picker_model.get('to');
    this.collection.fetch({
      from: from,
      to: to,
      guid: options.guid
    });
  },

  render: function(width) {
    var html = $(this.template).html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$geochart = this.$el.find('.geo_chart_container');
    this.$geochart.append(new App.View.Geo({
      collection: this.collection,
      width: this.width
    }).render().$el);
    return this;
  }
});