App.Collection.AppActiveUsersPlatform = App.Collection.PieMetrics.extend({
  model: App.Model.PieMetric,
  url: "/beta/static/mocks/metrics/app_active_users_dest.json",
  metric: 'apptransactionsdest'
});