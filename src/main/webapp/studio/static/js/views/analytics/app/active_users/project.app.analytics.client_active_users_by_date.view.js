App.View.ProjectAppAnalyticsActiveUsersByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: "App.Collection.AppActiveUsersDate",
  defaultOptions: {
    total: false,
    chart: {
      height: 400
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        month: '%e. %b',
        year: '%b'
      }
    },
    title: {
      text: 'Active Users by Date'
    }
  }
});