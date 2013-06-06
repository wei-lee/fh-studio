App.View.AppAnalytics = Backbone.View.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var html = $(this.template).html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    // Render dashboard by default
    this.renderDashboard();
    return this;
  },

  renderDashboard: function() {
    if (this.dashboard_view) {
      this.dashboard_view.remove();
    }
    this.dashboard_view = new this.views.dashboard({
      guid: this.options.guid,
      picker_model: this.options.picker_model
    });
    this.dashboard_view.render();
    this.$el.empty();
    this.$el.append(this.dashboard_view.el);
  },

  renderByDate: function() {
    if (this.by_date_view) {
      this.by_date_view.remove();
    }
    this.by_date_view = new this.views.byDate({
      chart: {
        width: $('.container').width()
      },
      guid: this.options.guid,
      picker_model: this.options.picker_model
    });
    this.$el.empty();
    this.$el.append(this.by_date_view.el);
  },

  renderByPlatform: function() {
    if (this.by_platform_view) {
      this.by_platform_view.remove();
    }
    this.by_platform_view = new this.views.byPlatform({
      chart: {
        width: $('.container').width()
      },
      guid: this.options.guid,
      picker_model: this.options.picker_model
    });
    this.$el.empty();
    this.$el.append(this.by_platform_view.el);
  },

  renderByLocation: function() {
    if (this.by_location_view) {
      this.by_location_view.remove();
    }
    this.by_location_view = new this.views.byLocation({
      fullscreen: true,
      guid: this.options.guid,
      picker_model: this.options.picker_model
    });
    this.$el.empty();
    this.$el.append(this.by_location_view.el);
  }
});