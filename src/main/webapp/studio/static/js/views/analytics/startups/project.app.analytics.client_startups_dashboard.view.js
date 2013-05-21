App.View.ProjectAppAnalyticsClientStartupsDashboard = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#project-app-analytics-client-startups-dashboard-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$by_date = this.$el.find('.by_date');
    this.$by_platform = this.$el.find('.by_platform');
    this.$by_location = this.$el.find('.by_location');

    this.$by_date.append(new App.View.ProjectAppAnalyticsClientStartupsByDate().render().$el);
    this.$by_platform.append(new App.View.ProjectAppAnalyticsClientStartupsByPlatform().render().$el);
    this.$by_location.append(new App.View.ProjectAppAnalyticsClientStartupsByLocation().render().$el);
  }
});