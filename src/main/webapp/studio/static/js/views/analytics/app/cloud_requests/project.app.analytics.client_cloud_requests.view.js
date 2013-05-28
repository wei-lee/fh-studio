App.View.ProjectAppAnalyticsCloudRequests = App.View.AppAnalytics.extend({
  template: "#project-app-analytics-cloud-requests-template",
  views: {
    dashboard: App.View.ProjectAppAnalyticsCloudRequestsDashboard,
    byDate: App.View.ProjectAppAnalyticsCloudRequestsByDate,
    byPlatform: App.View.ProjectAppAnalyticsCloudRequestsByPlatform,
    byLocation: App.View.ProjectAppAnalyticsCloudRequestsByLocation
  }
});
