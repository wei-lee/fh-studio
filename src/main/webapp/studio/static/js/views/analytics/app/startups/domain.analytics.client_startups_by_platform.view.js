App.View.DomainAnalyticsClientStartupsByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.DomainStartupsPlatform",
  defaultOptions: {
    chart: {
      height: 300
    },
    title: {
      text: 'Domain Startups by Platform'
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