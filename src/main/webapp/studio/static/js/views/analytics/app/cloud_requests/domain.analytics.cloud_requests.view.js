App.View.DomainAnalyticsCloudRequests = App.View.DomainAnalytics.extend({
  template: "#domain-cloud-requests-template",
  views: {
    dashboard: App.View.DomainAnalyticsCloudRequestsDashboard,
    byDate: App.View.DomainAnalyticsCloudRequestsByDate,
    byPlatform: App.View.DomainAnalyticsCloudRequestsByPlatform,
    byLocation: App.View.DomainAnalyticsCloudRequestsByLocation
  }
});