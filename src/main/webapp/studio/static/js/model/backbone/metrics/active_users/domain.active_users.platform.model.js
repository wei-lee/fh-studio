App.Collection.DomainActiveUsersPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/studio/static/js/model/mocks/metrics/domain_active_users_dest.json",
  metric: "domaintransactionsdest"
});