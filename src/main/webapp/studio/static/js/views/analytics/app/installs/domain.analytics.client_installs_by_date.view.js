App.View.DomainAnalyticsClientInstallsByDate = App.View.DomainAnalyticsByDate.extend({
  collection_type: "App.Collection.DomainInstallsDate",
  defaultOptions: {
    total: false,
    chart: {
      width: 300,
      height: 300
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%e. %b',
        year: '%b'
      }
    },
    title: {
      text: 'Installs by Date'
    }
  }
});