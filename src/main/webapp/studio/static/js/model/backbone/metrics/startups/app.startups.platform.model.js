App.Collection.AppStartupsPlatform = App.Collection.PieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/app_startups_dest.json",
  metric: "appstartupsdest"
});