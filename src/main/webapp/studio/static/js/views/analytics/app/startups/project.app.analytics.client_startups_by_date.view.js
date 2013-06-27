App.View.ProjectAppAnalyticsClientStartupsByDate = App.View.AppAnalyticsByDate.extend({
  collection_type: "App.Collection.AppStartupsDate",
  defaultOptions: {
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
      text: 'Startups by Date'
    }
  }
});