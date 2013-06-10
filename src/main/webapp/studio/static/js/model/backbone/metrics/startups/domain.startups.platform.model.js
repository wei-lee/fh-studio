App.Collection.DomainStartupsPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/studio/static/js/model/mocks/metrics/domain_startups_date.json",
  metric: "domainstartupsdest"
});