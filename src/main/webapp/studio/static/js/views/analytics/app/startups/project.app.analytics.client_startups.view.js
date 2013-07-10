App.View.ProjectAppAnalyticsStartups = App.View.AppAnalytics.extend({
  template: "#project-app-analytics-startups-template",
  views: {
    dashboard: App.View.ProjectAppAnalyticsClientStartupsDashboard,
    byDate: App.View.ProjectAppAnalyticsClientStartupsByDate,
    byPlatform: App.View.ProjectAppAnalyticsClientStartupsByPlatform,
    byLocation: App.View.ProjectAppAnalyticsClientStartupsByLocation
  }
});
