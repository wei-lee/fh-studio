App.View.ProjectAppAnalyticsStartups = Backbone.View.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var html = $("#project-app-analytics-startups-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    // Render dashboard by default
    this.renderDashboard();
    return this;
  },

  renderDashboard: function(options) {
    if (this.dashboard_view) {
      this.dashboard_view.remove();
    }
    this.dashboard_view = new App.View.ProjectAppAnalyticsClientStartupsDashboard({
      guid: options.guid || this.options.guid
    });
    this.dashboard_view.render();
    this.$el.empty();
    this.$el.append(this.dashboard_view.el);
  },

  renderByDate: function(options) {
    if (this.by_date_view) {
      this.by_date_view.remove();
    }
    this.by_date_view = new App.View.ProjectAppAnalyticsClientStartupsByDate({
      chart: {
        width: $('.container').width()
      },
      guid: options.guid || this.options.guid
    });
    this.by_date_view.render();
    this.$el.empty();
    this.$el.append(this.by_date_view.el);
  },

  renderByPlatform: function(options) {
    if (this.by_platform_view) {
      this.by_platform_view.remove();
    }
    this.by_platform_view = new App.View.ProjectAppAnalyticsClientStartupsByPlatform({
      chart: {
        width: $('.container').width()
      },
      guid: options.guid || this.options.guid
    });
    this.by_platform_view.render();
    this.$el.empty();
    this.$el.append(this.by_platform_view.el);
  },

  renderByLocation: function(options) {
    if (this.by_location_view) {
      this.by_location_view.remove();
    }
    this.by_location_view = new App.View.ProjectAppAnalyticsClientStartupsByLocation({
      width: $('.container').width(),
      guid: options.guid || this.options.guid
    });
    this.by_location_view.render();
    this.$el.empty();
    this.$el.append(this.by_location_view.el);
  },

  dashboard: function(e) {
    e.preventDefault();
    this.renderDashboard();
  },

  byDate: function(e) {
    e.preventDefault();
    this.renderByDate();
  },

  byPlatform: function(e) {
    e.preventDefault();
    this.renderByPlatform();
  },

  byLocation: function(e) {
    e.preventDefault();
    this.setActivePill(e);
    this.renderByLocation();
  }
});