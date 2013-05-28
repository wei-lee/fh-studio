App.View.ProjectAppAnalyticsActiveUsersDashboard = App.View.ProjectAppAnalyticsDashboard.extend({
  template: "#project-app-analytics-active-users-dashboard-template",
  views: {
    byDate: App.View.ProjectAppAnalyticsActiveUsersByDate,
    byPlatform: App.View.ProjectAppAnalyticsActiveUsersByPlatform,
    byLocation: App.View.ProjectAppAnalyticsActiveUsersByLocation
  }
});
