App.View.DomainAnalyticsClientStartupsByDate = App.View.DomainAnalyticsByDate.extend({
  collection_type: "App.Collection.DomainStartupsDate",
  defaultOptions: {
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
      text: 'Domain Startups by Date'
    }
  }
});