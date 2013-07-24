App.View.ProjectAppAnalyticsCloudRequestsByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: "App.Collection.AppCloudRequestsDate",
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
      text: 'Cloud Requests by Date'
    }
  }
});