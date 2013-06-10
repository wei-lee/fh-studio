App.Collection.AppStartupsPlatform = App.Collection.PieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/studio/static/js/model/mocks/metrics/app_startups_date.json",
  metric: "appstartupsdest"
});