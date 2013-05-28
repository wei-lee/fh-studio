App.View.ProjectAppAnalyticsActiveUsers = App.View.AppAnalytics.extend({
  template: "#project-app-analytics-active-users-template",
  views: {
    dashboard: App.View.ProjectAppAnalyticsActiveUsersDashboard,
    byDate: App.View.ProjectAppAnalyticsActiveUsersByDate,
    byPlatform: App.View.ProjectAppAnalyticsActiveUsersByPlatform,
    byLocation: App.View.ProjectAppAnalyticsActiveUsersByLocation
  }
});
