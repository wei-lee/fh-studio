App.Collection.DomainStartupsPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/domain_startups_dest.json",
  metric: "domainstartupsdest"
});