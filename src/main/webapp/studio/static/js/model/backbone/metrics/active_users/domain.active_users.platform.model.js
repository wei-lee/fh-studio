App.Collection.DomainActiveUsersPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/domain_transactions_dest.json",
  metric: "domaintransactionsdest"
});