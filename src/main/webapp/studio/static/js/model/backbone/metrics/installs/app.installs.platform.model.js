App.Collection.AppInstallsPlatform = App.Collection.PieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/studio/static/js/model/mocks/metrics/app_installs_date.json",
  metric: "appinstallsdest"
});