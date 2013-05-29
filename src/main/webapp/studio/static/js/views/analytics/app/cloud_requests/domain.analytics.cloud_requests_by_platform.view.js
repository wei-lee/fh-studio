App.View.DomainAnalyticsCloudRequestsByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.DomainCloudRequestsPlatform",
  defaultOptions: {
    chart: {
      width: 5000,
      height: 300
    },
    title: {
      text: 'Domain Cloud Requests by Platform'
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
        return '<b>' + this.key + '</b> ' + this.y + ' cloud requests - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  }
});