App.View.ProjectAppAnalyticsActiveUsersByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.AppActiveUsersPlatform",
  defaultOptions: {
    chart: {
      height: 300
    },
    title: {
      text: 'Active Users by Platform'
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
        return '<b>' + this.key + '</b> ' + this.y + ' users - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  }
});