App.View.DomainAnalyticsCloudRequestsByDate = App.View.DomainAnalyticsByDate.extend({
  collection_type: "App.Collection.DomainCloudRequestsDate",
  defaultOptions: {
    total: false,
    chart: {
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
      text: 'Domain Cloud Requests by Date'
    }
  }
});