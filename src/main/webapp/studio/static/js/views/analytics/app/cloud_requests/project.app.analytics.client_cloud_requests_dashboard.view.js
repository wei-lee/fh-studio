App.View.ProjectAppAnalyticsCloudRequestsDashboard = App.View.ProjectAppAnalyticsDashboard.extend({
  template: "#project-app-analytics-cloud-requests-dashboard-template",
  views: {
    byDate: App.View.ProjectAppAnalyticsCloudRequestsByDate,
    byPlatform: App.View.ProjectAppAnalyticsCloudRequestsByPlatform,
    byLocation: App.View.ProjectAppAnalyticsCloudRequestsByLocation
  }
});
