App.Collection.DomainCloudRequestsPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/studio/static/js/model/mocks/metrics/domain_requests_date.json",
  metric: "domainrequestsdest"
});