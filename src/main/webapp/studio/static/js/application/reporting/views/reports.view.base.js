var Reports = Reports || {};
Reports.View = Reports.View || {};
Reports.View.Chart = Reports.View.Chart || {};

Reports.View.Chart.Base = Class.extend({
  controller: null,
  model: null,
  series: null,
  series_name: null,
  renderTo: null,

  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
    this.series = params.series.all_series;
    this.series_name = params.series.series_name;
    this.renderTo = '#appreport-results'
    Log.append('Initialising chart view');
  },

  render: function() {
    var self = this;

    // Reset chart container
    var container = $(self.renderTo);
    container.empty();

    var series_data = this.series;
    var series_name = this.series_name;

    var counter_chart = new Highcharts.Chart({
      credits: {
        enabled: false
      },
      chart: {
        renderTo: container[0],
        zoomType: 'x',
        spacingRight: 20
      },
      title: {
        text: series_name
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
        }
      },
      exporting: {
        buttons: {
          exportButton: {
            menuItems: [{
              text: 'Export to PDF',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'application/pdf',
                  filename: self.model_series.name
                });
              }
            }, {
              text: 'Export to PNG',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'image/png',
                  filename: self.model_series.name
                });
              }
            }, {
              text: 'Export to CSV',
              onclick: function() {
                Log.append('Exporting to CSV.');
                var model = this.view.model;
                var filename = model.name + '.csv';

                // Call back to the model to export this series as CSV
                var csv = this.view.model.getCSVForSeries(this.model_series);
                var content_type = 'csv';
                this.view.controller.export(filename, csv, content_type);
              }
            },
            null, null]
          }
        }
      },
      yAxis: {
        title: {
          text: 'values'
        },
        min: 0
      },
      tooltip: {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          return '<b>' + this.series.name + '</b><br/>' + timestamp + ': ' + this.y;
        }
      },
      series: series_data
    });

    counter_chart.view = self;
    counter_chart.model_series = series_data;

  }
});