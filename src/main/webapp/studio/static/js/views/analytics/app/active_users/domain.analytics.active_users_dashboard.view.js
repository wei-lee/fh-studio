App.View.DomainAnalyticsActiveUsersDashboard = App.View.DomainAnalyticsDashboard.extend({
  template: "#domain-analytics-active-users-dashboard-template",
  views: {
    byDate: App.View.DomainAnalyticsActiveUsersByDate,
    byPlatform: App.View.DomainAnalyticsActiveUsersByPlatform,
    byLocation: App.View.DomainAnalyticsActiveUsersByLocation
  }
});