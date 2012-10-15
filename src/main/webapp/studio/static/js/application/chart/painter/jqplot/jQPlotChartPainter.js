(function() {
  "use strict";

  application.jqplot = application.jqplot || {};

  application.jqplot.jQPlotChartPainter = application.ChartPainter.extend({
    defaultOpts: {},

    init: function() {
      $.jqplot.config.enablePlugins = true;
    },

    colourForSeries: function(key) {
      if (key.match(/Windows/)) {
        return "#fb9d00";
      } else if (key.match(/berry/)) {
        return "#df3f1f";
      } else if (key == 'iPhone') {
        return "#666666";
      } else if (key == 'Android') {
        return "#7bb900";
      } else if (key == 'Studio') {
        return '#3d96ae';
      } else if (key == 'iPad') {
        return '#aa4643';
      }  else {
        var random_colours = ['#4572a7', '#aa4643', '#89a54e', '#80699b', '#3d96ae', '#db843d'];
        var random_colour = random_colours[Math.floor(Math.random() * random_colours.length)];
        return random_colour;
      }
    },

    labelForKey: function(key) {
      var label_map = {
        "android": "Android",
        "iphone": "iPhone",
        "ipad": "iPad",
        "blackberry": "BlackBerry",
        "wp7": "Windows Phone 7",
        "nokiawrt": "Nokia WRT",
        "windowsphone7": "Windows Phone 7"
      };
      return label_map[key] || key;
    },

    drawLineHighChart: function(data, container, opts, callback) {
      // Set the size of the chart div
      container.css({
        width: '95%',
        margin: '10px auto 10px auto'
      });

      var self = this;

      // Tranform into Highcharts series
      var series = [];
      $.each(opts.labels, function(i, label) {
        var name = self.labelForKey(label);
        var color = self.colourForSeries(name);
        var series_item = {
          name: name,
          data: data[i],
          color: color
        };
        series.push(series_item);
      });

      var chart = new Highcharts.Chart({
        credits: {
          enabled: false
        },
        chart: {
          renderTo: container[0],
          //type: 'area',
          zoomType: 'x',
          spacingRight: 20
        },
        // plotOptions: {
        //   area: {
        //     stacking: 'normal',
        //     lineColor: '#666666',
        //     lineWidth: 1,
        //     marker: {
        //       lineWidth: 1,
        //       lineColor: '#666666'
        //     }
        //   }
        // },
        title: {
          text: ''
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          }
        },
        yAxis: {
          title: {
            text: 'values'
          },
          min: 0
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
                    filename: 'chart'
                  });
                }
              }, {
                text: 'Export to PNG',
                onclick: function() {
                  var self = this;
                  this.exportChart({
                    type: 'image/png',
                    filename: 'chart'
                  });
                }
              }, {
                text: 'Export to CSV',
                onclick: function() {
                  console.log('Exporting to CSV.');

                  // For all series
                  var csv = [];

                  $.each(this.model_series, function(i, series) {
                    csv.push(series.name + "_Timestamp," + series.name + "_Value");
                    $.each(series.data, function(i, item) {
                      csv.push(item.join(","));
                    });
                  });

                  csv = csv.join("\n");

                  // Export
                  $('#export_form').remove();

                  $('body').append('<form name="export_form" id="export_form" method="post" action="' + Constants.TRIGGER_DOWNLOAD_URL + '"><input type="hidden" name="content" value=""><input type="hidden" name="content_type" value=""><input type="hidden" name="filename" value=""><input type="submit" name="export_json_submit" id="export_json_submit" value="Export" style="display: none"></form>');
                  $("#export_form input[name=content]").val(csv);
                  $("#export_form input[name=content_type]").val('csv');
                  $("#export_form input[name=filename]").val('export.csv');
                  $('#export_form').submit();
                }
              },
              null, null]
            }
          }
        },
        tooltip: {
          formatter: function() {            
            var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
            return '<b>' + this.series.name + '</b><br/>' + timestamp + ': ' + this.y;
          }
        },
        series: series
      });

      chart.model_series = series;

      callback();
    },

    drawPieHighChart: function(data, container, opts, callback) {
      var self = this;
      data = data[0];
      var series = [];

      var series_item = {
        type: 'pie',
        name: '',
        data: []
      };

      $.each(data, function(i, item) {
        var name = self.labelForKey(item[0]);
        var color = self.colourForSeries(item[0]);
        series_item.data.push({
          name: name,
          y: item[1],
          color: color
        });
      });

      series.push(series_item);

      // Set the size of the chart div
      container.css({
        width: '95%',
        margin: '10px auto 10px auto'
      });

      var chart = new Highcharts.Chart({
        chart: {
          renderTo: container[0],
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        credits: {
          enabled: false
        },
        title: {
          text: ''
        },
        tooltip: {
          formatter: function() {
            return '<b>' + this.point.name + '</b>: ' + this.point.y;
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            showInLegend: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              formatter: function() {
                return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
              }
            }
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
                    filename: 'chart'
                  });
                }
              }, {
                text: 'Export to PNG',
                onclick: function() {
                  var self = this;
                  this.exportChart({
                    type: 'image/png',
                    filename: 'chart'
                  });
                }
              }, {
                text: 'Export to CSV',
                onclick: function() {
                  console.log('Exporting to CSV.');

                  // For all series
                  var csv = [];
                  var series_items = this.model_series[0].data;
                  $.each(series_items, function(i, item) {
                    csv.push(item.name);
                    csv.push(item.y);
                    csv.push("\n");
                  });

                  csv = csv.join("\n");

                  // Export
                  $('#export_form').remove();

                  $('body').append('<form name="export_form" id="export_form" method="post" action="' + Constants.TRIGGER_DOWNLOAD_URL + '"><input type="hidden" name="content" value=""><input type="hidden" name="content_type" value=""><input type="hidden" name="filename" value=""><input type="submit" name="export_json_submit" id="export_json_submit" value="Export" style="display: none"></form>');
                  $("#export_form input[name=content]").val(csv);
                  $("#export_form input[name=content_type]").val('csv');
                  $("#export_form input[name=filename]").val('export.csv');
                  $('#export_form').submit();
                }
              },
              null, null]
            }
          }
        },
        series: series
      });

      chart.model_series = series;

      callback();
    },

    drawHighCharts: function(data, container, opts, callback) {
      if (opts.chart_type == 'line') {
        this.drawLineHighChart(data, container, opts, callback);
      } else if (opts.chart_type == 'pie') {
        this.drawPieHighChart(data, container, opts, callback);
      }
    },

    draw: function(data, container, opts, callback) {
      if (opts.draw_with == 'highcharts') {
        return this.drawHighCharts(data, container, opts, callback);
      } else {
        // Draw with jqPlot
        var self = this,
            di, dl, dt, yMax, yMin, ri, rl, rt;
        console.log('jqplot default opts:' + JSON.stringify(this.defaultOpts));

        // Determine the best no. of ticks to show
        opts.xTicks = self.optimiseXTicks(opts.xTicks || data[0].length);
        console.log('xTicks: ' + opts.xTicks);

        // Figure out max value on y axis
        yMin = data[0][0][1];
        yMax = 0;
        for (ri = 0, rl = data.length; ri < rl; ri += 1) {
          rt = data[ri];
          for (di = 0, dl = rt.length; di < dl; di += 1) {
            dt = rt[di][1];
            if (dt > yMax) {
              yMax = dt;
            }
            if (dt < yMin) {
              yMin = dt;
            }
          }
        }
        opts.yTicks = self.optimiseYTicks(yMin, yMax);

        opts = this.overrideOpts(opts);
        console.log('jqplot overriden opts:' + JSON.stringify(opts));

        // Set the size of the chart div
        container.css({
          width: '85%',
          //opts.width ? opts.width + 'px' : '400px',
          height: opts.height ? opts.height + 'px' : '450px',
          margin: '0 auto'
        });

        $.jqplot(container.attr('id'), data, opts);
        callback();
      }
    },

    overrideOpts: function(opts) {
      var shellOpts, newOpts;

      shellOpts = {
        title: opts.title,
        series: opts.series,
        axes: {
          xaxis: {
            renderer: opts.xaxisRenderer === 'date' ? $.jqplot.DateAxisRenderer : undefined,
            tickOptions: opts.xaxisRenderer === 'date' ? {
              formatString: '%e-%b-%y',
              showGridline: false
            } : undefined,
            padMax: 1.0,
            padMin: 1.0,
            numberTicks: opts.xTicks || undefined
          },
          yaxis: {
            renderer: opts.yaxisRenderer === 'date' ? $.jqplot.DateAxisRenderer : undefined,
            tickOptions: {
              formatString: opts.yaxisRenderer !== 'date' ? '%.0f' : undefined
            },
            min: 0,
            ticks: opts.yTicks
          }
        },
        seriesDefaults: {
          lineWidth: 1,
          markerOptions: {
            lineWidth: 1.2,
            style: 'circle',
            size: 2
          },
          rendererOptions: {
            showDataLabels: 'undefined' !== typeof opts.dataLabels ? true : undefined,
            dataLabels: opts.dataLabels
          }
        },
        legend: {
          show: opts.legend,
          placement: opts.legendPlacement,
          location: opts.legendLoc,
          rendererOptions: {
            numberRows: opts.legendRows,
            numberCols: opts.legendCols
          },
          labels: opts.labels
        }
      };
      newOpts = $.extend(true, {}, this.defaultOpts, shellOpts);

      return newOpts;
    },

    optimiseXTicks: function(ticks) {
      var opt = ticks,
          dStart, dCurrent;

      // We can show from 2 to 16 ticks no problem
      if (opt < 2) {
        // Min of 2
        opt = 2;
      } else if (opt > 16) {
        // More than 16, determine which denominator of the ticks would suit
        dStart = 15;
        dCurrent = 15;
        opt -= 1; // subtract 1
        while (0 !== (opt % dCurrent) && dCurrent > 7) {
          dCurrent -= 1;
        }

        opt = dCurrent + 1;
      }

      return opt;
    },

    optimiseYTicks: function(min, max) {
      var self = this,
          opt, range;

      range = max - min;

      if (range > 100) {
        opt = self.optimiseTicks(range, min, max);
      }

      return opt;
    },

    optimiseTicks: function(range, min, max) {
      var tries = [1, 2.5, 5, 10],
          opt = [],
          hundreds, multiplier, gaps, tempMulti, tempVal, tempMax, ti, tl, tt, optimised = false;

      hundreds = range.toString().length - 2;
      multiplier = Math.pow(10, hundreds);

      ti = 0;
      tl = tries.length;

      while (!optimised && ti < tl) {
        tt = tries[ti];
        tempMulti = tt * multiplier;
        gaps = Math.round(range / tempMulti);

        // 10 or less ticks are ideal on y axis
        if (gaps < 11) {
          tempVal = Math.floor(min / tempMulti) * tempMulti;
          tempMax = max + tempMulti;
          while (tempVal < tempMax) {
            opt.push(tempVal);
            tempVal += tempMulti;
          }
          optimised = true;
        }

        ti += 1;
      }

      return opt;

    }
  });
}());