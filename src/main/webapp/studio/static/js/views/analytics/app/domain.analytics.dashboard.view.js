App.View.DomainAnalyticsDashboard = Backbone.View.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var html = $(this.template).html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$by_date = this.$el.find('.by_date');
    this.$by_platform = this.$el.find('.by_platform');
    this.$by_location = this.$el.find('.by_location');

    this.$by_date.append(new this.views.byDate({
      guid: this.options.guid,
      picker_model: this.options.picker_model
    }).$el);

    this.$by_platform.append(new this.views.byPlatform({
      guid: this.options.guid,
      picker_model: this.options.picker_model
    }).$el);
    
    this.$by_location.append(new this.views.byLocation({
      guid: this.options.guid,
      picker_model: this.options.picker_model
    }).$el);

    return this;
  }
});