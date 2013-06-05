App.View.ProjectAppAnalyticsCloudRequestsByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.AppCloudRequestsPlatform",
  defaultOptions: {
    chart: {
      height: 300
    },
    title: {
      text: 'Cloud Requests by Platform'
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
        return '<b>' + this.key + '</b> ' + this.y + ' requests - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  }
});