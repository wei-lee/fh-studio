App.View.ProjectAppAnalyticsClientStartupsByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.AppStartupsPlatform",
  defaultOptions: {
    chart: {
      height: 400
    },
    title: {
      text: 'Startups by Platform'
    },
    xAxis: {
      categories: []
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      }
    },
    tooltip: {
      formatter: function() {
        return '<b>' + this.key + '</b> ' + this.y + ' startups - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  }
});