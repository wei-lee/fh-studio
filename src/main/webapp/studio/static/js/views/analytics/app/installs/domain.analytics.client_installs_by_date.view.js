App.View.DomainAnalyticsClientInstallsByDate = App.View.DomainAnalyticsByDate.extend({
  collection_type: "App.Collection.DomainInstallsDate",
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
      text: 'Domain Installs by Date'
    }
  }
});