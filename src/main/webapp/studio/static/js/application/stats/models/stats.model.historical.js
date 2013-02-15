Stats.Model.Historical = Stats.Model.Base.extend({
  //_mock: Stats.Mock.history.results,

  init: function(params) {
    this._super(params);
  },

  getSeries: function(series_name) {
    var data = this._transform();
    var series_data = {
      series_name: null,
      all_series: []
    };

    var base_match = data[series_name] ? data[series_name].series || null : null;
    if (base_match) {
      series_data.series_name = series_name;
      // Base match, flatten hash into array of series items
      $.each(base_match, function(k, v) {
        series_data.all_series.push(v);
      });
    }
    return series_data;
  },

  getAllSeries: function() {
    var data = this._transform();

    return data;
  },

  getAllSeriesNames: function() {
    var data = this._transform();
    var names = [];

    $.each(data, function(key, value) {
      names.push(key);
    });

    return names;
  },

  getCSVForSeries: function(all_series) {
    // For all series
    var self = this;
    var csv = [];

    $.each(all_series, function(i, series) {
      csv.push(series.name + "_Timestamp," + series.name + "_Value");
      $.each(series.data, function(i, item) {
        csv.push(item.join(","));
      });
    });

    return csv.join("\n");
  },

  seriesMax: function(series) {
    var max = 0;
    $.each(series.data, function(i, item) {
      // last is value
      var value = item[1];
      if (value > max) {
        max = value;
      }
    });
    return max;
  },

  _sanitizeSeriesName: function(series_name) {
    var split_name = series_name.split("_app_");

    if (split_name.length > 1) {
      return split_name[1];
    } else {
      return split_name[0];
    }
  },

  _colourForSeries: function(key) {
    if (key.match(/_upper/)) {
      return "#7798BF";
    } else if (key.match(/_lower/)) {
      return "#55BF3B";
    } else if (key.match(/_mean/)) {
      return "#DF5353";
    } else {
      return "#666";
    }
  },

  _initMockData: function (opts) {
    opts = opts || {};
    // base is a value between 0 and 1
    // min is min value of generated val - may be affected by variance
    // max is max value of generated val - may be affected by variance
    // variance is % variance of the value, between 0 and 1
    function genVal(base, min, max, variance) {
      var val = min + (base * (max - min));
      valVariance = val * variance;
      val = Math.round((val - valVariance) + (Math.random() * valVariance));
      return val;
    }

    function getRand(min, max) {
      return min + (Math.random() * (max - min));
    }

    function getStats(base, degOffset, minAvg, maxAvg) {
      var stats = {};

      stats.mean = genVal(Math.abs(Math.sin(((base * 0.5) + degOffset) * (Math.PI/180))), minAvg, maxAvg, 0.1);
      stats.upper = getRand(stats.mean * 1.1, stats.mean * 1.2);
      stats.lower = getRand(stats.mean * 0.8, stats.mean * 0.9);

      return stats;
    }

    // initialise the mock data once
    if (this._mock == null) {
      this._mock = {
        interval: 10000,
        results: []
      };
      var interval = this._mock.interval;
      var intervalSeconds = interval / 1000;
      var numPoints = 100;
      var startTS = new Date().getTime();

      for (var mi = 0; mi < numPoints; mi += 1) {
        var ts = startTS - ((numPoints - mi) * interval);

        var stretch = 0.5; // lower = less waves visible i.e. more stretch
        var c1 = genVal(Math.abs(Math.sin((mi * stretch) * (Math.PI/180))), 20, 50, 0.25);
        var c2 = genVal(Math.abs(Math.sin(((mi * stretch) + 90) * (Math.PI/180))), 18, 33, 0.16); // offset 90degress >
        var c3 = genVal(Math.abs(Math.sin(((mi * 2) - 90) * (Math.PI/180))), 0, 12, 0.40); // offset 90degrees <

        var t1Count = genVal(Math.abs(Math.sin((mi * stretch) * (Math.PI/180))), 100, 250, 0.25); // between 100 and 250 timer updates in this ts
        var t1Stats = getStats(mi, -45, 20, 120); // min avg of. 400ms, max avg. of 600ms
        var t1Lower = t1Stats.lower;
        var t1Upper = t1Stats.upper;
        var t1Mean = t1Stats.mean;

        var t2Count = genVal(Math.abs(Math.sin((mi * stretch) * (Math.PI/180))), 30, 150, 0.25);
        var t2Stats = getStats(mi, 45, 50, 250);
        var t2Lower = t2Stats.lower;
        var t2Upper = t2Stats.upper;
        var t2Mean = t2Stats.mean;

        var t3Count = genVal(Math.abs(Math.sin((mi * stretch) * (Math.PI/180))), 50, 250, 0.25);
        var t3Stats = getStats(mi, -135, 40, 120);
        var t3Lower = t3Stats.lower;
        var t3Upper = t3Stats.upper;
        var t3Mean = t3Stats.mean;

        var mockRow = {
          "counters": [{
            "value": {
              "valuePerSecond": c1 / intervalSeconds,
              "value": c1
            },
            "key": opts.c1name || "test_counter_1"
          }, {
            "value": {
              "valuePerSecond": c2 / intervalSeconds,
              "value": c2
            },
            "key": opts.c2name || "test_counter_2"
          }, {
            "value": {
              "valuePerSecond": c3 / intervalSeconds,
              "value": c3
            },
            "key": opts.c3name || "test_counter_3"
          }],
          "timers": [{
            "value": {
              "lower": t1Lower,
              "upper": t1Upper,
              "count": t1Count,
              "pcts": [{
                "pct": "90",
                "value": {
                  "upper": t1Upper,
                  "mean": t1Mean
                }
              }]
            },
            "key": opts.t1name || "test_timer_1"
          }, {
            "value": {
              "lower": t2Lower,
              "upper": t2Upper,
              "count": t2Count,
              "pcts": [{
                "pct": "90",
                "value": {
                  "upper": t2Upper,
                  "mean": t2Mean
                }
              }]
            },
            "key": opts.t2name || "test_timer_2"
          }, {
            "value": {
              "lower": t3Lower,
              "upper": t3Upper,
              "count": t3Count,
              "pcts": [{
                "pct": "90",
                "value": {
                  "upper": t3Upper,
                  "mean": t3Mean
                }
              }]
            },
            "key": opts.t3name || "test_timer_3"
          }],
          "ts": ts
        };

        if(opts.gauges && opts.gauges){
          mockRow.gauges = [];
          for(var p=0;p<opts.gauges.length;p++){
            mockRow.gauges.push({key: opts.gauges[p].key, value: getRand(opts.gauges[p].min, opts.gauges[p].max)})
          }
        }

        this._mock.results.push(mockRow);
      }
    }
  }
});