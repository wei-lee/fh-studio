App.View.DomainAnalyticsClientInstallsByPlatform = App.View.AppAnalyticsByPlatform.extend({
  collection_type: "App.Collection.DomainInstallsPlatform",
  defaultOptions: {
    chart: {
      width: 5000,
      height: 300
    },
    title: {
      text: 'Domain Installs by Platform'
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
        return '<b>' + this.key + '</b> ' + this.y + ' installs - <b>' + _.str.numberFormat(this.percentage, 2, '.') + '%</b>';
      }
    },
    series: []
  }
});