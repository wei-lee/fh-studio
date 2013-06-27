App.View.DomainAnalyticsActiveUsers = App.View.DomainAnalytics.extend({
  template: "#domain-active-users-template",
  views: {
    dashboard: App.View.DomainAnalyticsActiveUsersDashboard,
    byDate: App.View.DomainAnalyticsActiveUsersByDate,
    byPlatform: App.View.DomainAnalyticsActiveUsersByPlatform,
    byLocation: App.View.DomainAnalyticsActiveUsersByLocation
  }
});