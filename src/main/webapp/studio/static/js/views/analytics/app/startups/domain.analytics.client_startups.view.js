App.View.DomainAnalyticsStartups = App.View.DomainAnalytics.extend({
  template: "#domain-analytics-startups-template",
  views: {
    dashboard: App.View.DomainAnalyticsClientStartupsDashboard,
    byDate: App.View.DomainAnalyticsClientStartupsByDate,
    byPlatform: App.View.DomainAnalyticsClientStartupsByPlatform,
    byLocation: App.View.DomainAnalyticsClientStartupsByLocation
  }
});
