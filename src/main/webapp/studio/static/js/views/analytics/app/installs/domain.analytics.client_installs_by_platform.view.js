App.View.DomainAnalyticsClientInstallsByPlatform = App.View.DomainAnalyticsByPlatform.extend({
  collection_type: "App.Collection.DomainInstallsPlatform",
  defaultOptions: {
    chart: {
      height: 400
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