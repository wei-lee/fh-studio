var Stats = Stats || {};
Stats.View = Stats.View || {};

Stats.View.Chart.APICalls = Stats.View.Chart.extend({

  init: function(params) {
    this._super(params);
  },

  render: function() {
    //this._super();
    var self = this;

    // Reset chart container
    var container = $(self.renderTo);
    container.empty();

    var series_data = this.series;

    var intervalSeconds = Math.round(self.model.interval / 1000);
    var chart = new Highcharts.Chart({
      credits: {
        enabled: false
      },
      chart: {
        renderTo: container[0],
        zoomType: 'x',
        spacingRight: 20,
        events: {
          load: function () {
            var innerSelf = this;
            // self.refreshInterval = setInterval(function () {
            //   if ($(innerSelf.container).is(':visible')) {
            //   self.updatePoints(innerSelf);
            //   } else {
            //     clearInterval(self.refreshInterval);
            //   }
            // }, self.model.interval);
          }
        }
      },
      scrollbar: {
        enabled: true
      },
      navigator : {
        enabled : true
      },
      rangeselector: {
        enabled: false
      },
      title: null,
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
        },
        title: {
          text: Lang['stats_apicalls_requests_xaxis'].replace('%interval%', intervalSeconds)
        },
        range: 600 * 1000 // 10 minutes
      },
      legend: {
        layout: 'horizontal',
        verticalAlign: 'top',
        backgroundColor: '#FFFFFF',
        shadow: true
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
                console.log('Exporting to CSV.');
                var model = this.view.model;
                var filename = model.name + '.csv';

                // Call back to the model to export this series as CSV
                var csv = this.view.model.getCSVForSeries(this.model_series);
                var content_type = 'csv';
                this.view.controller.doExport(filename, csv, content_type);
              }
            },
            null, null]
          }
        }
      },
      yAxis: [{
        labels: {
          formatter: function () {
            return this.value + 'ms';
          },
          style: {
            color: '#AA4643'
          }
        },
        title: {
          text: Lang['stats_apicalls_request_times_axis']
        },
        min: 0
      }, {
        labels: {
          formatter: function () {
            return this.value;
          },
          style: {
            color: '#666'
          }
        },
        title: {
          text: Lang['stats_apicalls_requests_number_axis'].replace('%interval%', intervalSeconds)
        },
        min: 0
      }],
      tooltip: {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          var units = {};
          units[Lang.stats_apicalls_request_times_upper] = 'ms';
          units[Lang.stats_apicalls_request_times_lower] = 'ms';
          units[Lang.stats_apicalls_request_times_90th_percentile_mean] = 'ms';
          units[Lang.stats_apicalls_requests_number] = '';
          units[Lang.stats_apicalls_requests_active] = '';
          units[Lang.stats_apicalls_requests_average_concurrent] = '';

          return '<b>' + this.series.name + '</b><br/>' + timestamp + ': ' + this.y + units[this.series.name];
        }
      },
      series: series_data
    });

    chart.view = self;
    chart.model_series = series_data;

  },

  updatePoints: function (chart) {
              // console.log('getting latest data');

              // var x = (new Date()).getTime(), // current time
              //     y = Math.random();

              // series.addPoint([x, y], true, true);
    var self = this;
    var model = self.model;
    var series = chart.series[0];
    var lastTimestamp = chart.series[0].data[chart.series[0].data.length - 1].x;
    model.load({
      count: 2,
      loaded: function(res) {
        console.log('Stats loaded');
        if (res.status == 'ok') {
          model.applyFilter({
            name: 'filterDate',
            from: new Date(lastTimestamp)
          });

          var data = model.getSeries(self.series_name).all_series; // e.g. [{"yAxis":1,"name":"No. Requests","data":[[1346946637838,38],[1346946647838,38]],"color":"#666","type":"spline","dashStyle":"shortdot","marker":{"radius":4},"zeroes":true},{"yAxis":0,"name":"Longest Request","data":[[1346946637838,519],[1346946647838,523]],"color":"#7798BF"},{"yAxis":0,"name":"Shortest Request","data":[[1346946637838,504],[1346946647838,503]],"color":"#55BF3B"},{"yAxis":0,"name":"90th percentile mean","data":[[1346946637838,508.7352941176471],[1346946647838,510]],"color":"#DF5353"}]
          for (var ci = 0, cl = chart.series.length; ci < cl; ci += 1) {
            var ct = data[ci] ? data[ci].data : null;
            if (ct != null) {
              for (var ddi = 0, ddl = ct.length; ddi < ddl; ddi += 1) {
                chart.series[ci].addPoint(ct[ddi], true, true);
              }
            } else {
              // no data
            }
          }
        } else {
          console.log("Couldn't load stats: " + model.name);
          // TODO: clear interval??
        }
      }
    });
  }
});