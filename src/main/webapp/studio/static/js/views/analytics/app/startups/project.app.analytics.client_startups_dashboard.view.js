App.View.ProjectAppAnalyticsClientStartupsDashboard = App.View.ProjectAppAnalyticsDashboard.extend({
  template: "#project-app-analytics-client-startups-dashboard-template",
  views: {
    byDate: App.View.ProjectAppAnalyticsClientStartupsByDate,
    byPlatform: App.View.ProjectAppAnalyticsClientStartupsByPlatform,
    byLocation: App.View.ProjectAppAnalyticsClientStartupsByLocation
  }
});
