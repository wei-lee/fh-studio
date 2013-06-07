App.View.ProjectAppAnalyticsDashboard = Backbone.View.extend({
  events: {
    'click .highcharts-title tspan': 'show'
  },
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var self = this;
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

    // Title links
    this.$el.find('.highcharts-title tspan').unbind().livequery('click', function(e) {
      self.show(e);
    });

    return this;
  },

  show: function(e) {
    // TODO: This is a bit ghetto
    try {
      var title = $(e.currentTarget).text();
      var match = title.split('by ')[1];
      var nav_el = $('.nav.reporting_pills li a:contains(' + match + ')');
      nav_el.trigger('click');
    } catch (e) {
      console.log("Couldn't find a nav item to trigger.");
    }
  }
});