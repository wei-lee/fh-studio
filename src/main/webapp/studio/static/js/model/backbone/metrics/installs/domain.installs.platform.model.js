App.Collection.DomainInstallsPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/studio/static/js/model/mocks/metrics/domain_installs_date.json",
  metric: "domaininstallsdest"
});