App.Collection.DomainInstallsPlatform = App.Collection.DomainPieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/domain_installs_dest.json",
  metric: "domaininstallsdest"
});