App.View.ProjectAppAnalyticsInstalls = App.View.AppAnalytics.extend({
  template: "#project-app-analytics-installs-template",
  views: {
    dashboard: App.View.ProjectAppAnalyticsClientInstallsDashboard,
    byDate: App.View.ProjectAppAnalyticsClientInstallsByDate,
    byPlatform: App.View.ProjectAppAnalyticsClientInstallsByPlatform,
    byLocation: App.View.ProjectAppAnalyticsClientInstallsByLocation
  }
});