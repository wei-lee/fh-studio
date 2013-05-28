App.View.ProjectAppAnalyticsClientInstallsByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: App.Collection.AppInstallsDate,
  defaultOptions: {
    total: false,
    chart: {
      width: 350,
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