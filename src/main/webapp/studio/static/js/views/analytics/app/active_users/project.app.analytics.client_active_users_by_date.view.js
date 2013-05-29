App.View.ProjectAppAnalyticsActiveUsersByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: "App.Collection.AppActiveUsersDate",
  defaultOptions: {
    total: false,
    chart: {
      width: 300,
      height: 300
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