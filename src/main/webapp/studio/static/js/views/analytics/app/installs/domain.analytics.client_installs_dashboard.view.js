App.View.DomainAnalyticsClientInstallsDashboard = App.View.DomainAnalyticsDashboard.extend({
  template: "#domain-analytics-client-installs-dashboard-template",
  views: {
    byDate: App.View.DomainAnalyticsClientInstallsByDate,
    byPlatform: App.View.DomainAnalyticsClientInstallsByPlatform,
    byLocation: App.View.DomainAnalyticsClientInstallsByLocation
  }
});