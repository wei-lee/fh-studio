App.View.ProjectAppAnalyticsClientInstallsByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: "App.Collection.AppInstallsDate",
  defaultOptions: {
    total: false,
    chart: {
      height: 400
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