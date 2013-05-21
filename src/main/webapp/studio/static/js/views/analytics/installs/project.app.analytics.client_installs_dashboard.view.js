App.View.ProjectAppAnalyticsClientInstallsDashboard = Backbone.View.extend({
  initialize: function() {},

  rangeChange: function() {
    console.log('range changed!');
  },

  render: function() {
    var html = $("#project-app-analytics-client-installs-dashboard-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$by_date = this.$el.find('.by_date');
    this.$by_platform = this.$el.find('.by_platform');
    this.$by_location = this.$el.find('.by_location');

    // TODO: Normally, collection passed in
    this.$by_date.append(new App.View.ProjectAppAnalyticsClientInstallsByDate().render().$el);
    this.$by_platform.append(new App.View.ProjectAppAnalyticsClientInstallsByPlatform().render().$el);
    this.$by_location.append(new App.View.ProjectAppAnalyticsClientInstallsByLocation().render().$el);
  }
});