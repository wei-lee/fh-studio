App.Collection.DomainCloudRequestsPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/domain_requests_dest.json",
  metric: "domainrequestsdest"
});