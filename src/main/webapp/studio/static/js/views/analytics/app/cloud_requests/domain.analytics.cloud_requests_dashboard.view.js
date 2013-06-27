App.View.DomainAnalyticsCloudRequestsDashboard = App.View.DomainAnalyticsDashboard.extend({
  template: "#domain-analytics-cloud-requests-dashboard-template",
  views: {
    byDate: App.View.DomainAnalyticsCloudRequestsByDate,
    byPlatform: App.View.DomainAnalyticsCloudRequestsByPlatform,
    byLocation: App.View.DomainAnalyticsCloudRequestsByLocation
  }
});