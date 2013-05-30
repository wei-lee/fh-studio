App.Collection.AppCloudRequestsPlatform = App.Collection.PieMetrics.extend({
  model: App.Model.PieMetric,
  metric: "apprequestsdest",
  url: "/beta/static/mocks/metrics/app_cloud_requests_dest.json"
});