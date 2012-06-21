application.MetricsChartLocator = application.ChartLocator.extend({
  
  // available charts
  charts: {
    line: {
      opts: {
        //title: 'App Installs',
        xaxisRenderer: 'date',
        legend: true,
        legendLoc: 'nw',
        legendPlacement: 'inside'
      },
      type: 'line',
      dataLoc: 'metrics'
    },
    pie: {
      type: 'pie',
      dataLoc: 'metrics'
    },
    geo: {
      type: 'geo',
      dataLoc: 'metrics'
    }
  }
  
});
