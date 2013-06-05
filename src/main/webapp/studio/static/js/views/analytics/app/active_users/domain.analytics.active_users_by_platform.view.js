App.View.DomainAnalyticsActiveUsersByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.DomainActiveUsersPlatform",
  defaultOptions: {
    chart: {
      height: 300
    },
    title: {
      text: 'Domain Active Users by Platform'
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
        return '<b>' + this.key + '</b> ' + this.y + ' active users - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  }
});