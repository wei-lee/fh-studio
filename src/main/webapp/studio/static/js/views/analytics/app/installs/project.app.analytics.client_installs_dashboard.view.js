App.View.ProjectAppAnalyticsClientInstallsDashboard = App.View.ProjectAppAnalyticsDashboard.extend({
  template: "#project-app-analytics-client-installs-dashboard-template",
  views: {
    byDate: App.View.ProjectAppAnalyticsClientInstallsByDate,
    byPlatform: App.View.ProjectAppAnalyticsClientInstallsByPlatform,
    byLocation: App.View.ProjectAppAnalyticsClientInstallsByLocation
  }
});