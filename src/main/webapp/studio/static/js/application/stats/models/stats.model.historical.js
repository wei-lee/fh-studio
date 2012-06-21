Stats.Model.Historical = Stats.Model.Base.extend({
  _mock: Stats.Mock.history.results,

  init: function(params) {
    this._super(params);
  },

  getSeries: function(series_name) {
    var data = this._transform();
    var series_data = {
      series_name: null,
      all_series: []
    };

    var base_match = data[series_name].series || null;
    if (base_match) {
      series_data.series_name = series_name;
      // Base match, flatten hash into array of series items
      $.each(base_match, function(k, v) {
        series_data.all_series.push(v);
      });
    }
    return series_data;
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
      return "#7bb900";
    }
  }
});