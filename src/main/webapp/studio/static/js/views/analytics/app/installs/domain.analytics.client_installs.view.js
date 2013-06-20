App.View.DomainAnalyticsInstalls = App.View.DomainAnalytics.extend({
  template: "#domain-installs-template",
  views: {
    dashboard: App.View.DomainAnalyticsClientInstallsDashboard,
    byDate: App.View.DomainAnalyticsClientInstallsByDate,
    byPlatform: App.View.DomainAnalyticsClientInstallsByPlatform,
    byLocation: App.View.DomainAnalyticsClientInstallsByLocation
  }
});