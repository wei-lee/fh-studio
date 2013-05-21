App.View.ProjectAppAnalyticsActiveUsersDashboard = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#project-app-analytics-active-users-dashboard-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$by_date = this.$el.find('.by_date');
    this.$by_platform = this.$el.find('.by_platform');
    this.$by_location = this.$el.find('.by_location');

    // TODO: Normally, collection passed in
    this.$by_date.append(new App.View.ProjectAppAnalyticsActiveUsersByDate().render().$el);
    this.$by_platform.append(new App.View.ProjectAppAnalyticsActiveUsersByPlatform().render().$el);
    this.$by_location.append(new App.View.ProjectAppAnalyticsActiveUsersByLocation().render().$el);
  }
});