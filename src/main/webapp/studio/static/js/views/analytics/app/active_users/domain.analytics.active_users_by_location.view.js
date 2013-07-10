App.View.DomainAnalyticsActiveUsersByLocation = App.View.DomainAnalyticsByLocation.extend({
  template: "#domain-analytics-active-users-bylocation-template",
  collection_type: "App.Collection.DomainActiveUsersGeo",
  title: "Domain Active Users by Location"
});