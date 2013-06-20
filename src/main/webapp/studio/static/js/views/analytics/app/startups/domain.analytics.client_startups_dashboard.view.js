App.View.DomainAnalyticsClientStartupsDashboard = App.View.DomainAnalyticsDashboard.extend({
  template: "#project-app-analytics-client-startups-dashboard-template",
  views: {
    byDate: App.View.DomainAnalyticsClientStartupsByDate,
    byPlatform: App.View.DomainAnalyticsClientStartupsByPlatform,
    byLocation: App.View.DomainAnalyticsClientStartupsByLocation
  }
});
