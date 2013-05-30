App.Collection.AppInstallsPlatform = App.Collection.PieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/app_installs_dest.json",
  metric: "appinstallsdest"
});