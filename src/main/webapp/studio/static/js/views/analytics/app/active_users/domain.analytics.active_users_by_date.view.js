App.View.DomainAnalyticsActiveUsersByDate = App.View.DomainAnalyticsByDate.extend({
  collection_type: "App.Collection.DomainActiveUsersDate",
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
      text: 'Domain Active Users by Date'
    }
  }
});