App.View.ProjectAppAnalyticsCloudRequestsByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: App.Collection.AppCloudRequestsDate,
  defaultOptions: {
    total: false,
    chart: {
      width: 350,
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
      text: 'Cloud Requests by Date'
    }
  }
});