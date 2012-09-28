Stats.Model.Historical.Timers = Stats.Model.Historical.extend({
  /**
   * Model name is required, used by controller for mapping models and views
   */
  name: 'timers',

  init: function(params) {
    this._super(params);
  },

  _transform: function() {
    var self = this;

    if (this.transformedData == null) { // TODO: revisit if using filters
      console.log('transforming data');
      var data = this.getData();
      var temp_data = {};

      // upper, lower, pcts[0].value.mean
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var timestamp = new Date(row.ts).getTime();
        var timers = row.timers;

        for (var j = 0; j < timers.length; j++) {
          var timer_row = timers[j];
          // Base Key
          var key = self._sanitizeSeriesName(timer_row.key);

          // Create base series objects
          if (!temp_data.hasOwnProperty(key)) {
            // Create
            temp_data[key] = {
              name: key,
              series: {}
            };
          }

          // Upper
          var upper_key = key + '_upper';
          var upper_value = timer_row.value.upper;
          if (!temp_data[key].series.hasOwnProperty(upper_key)) {
            // Create
            temp_data[key].series[upper_key] = {
              name: upper_key,
              data: [],
              color: self._colourForSeries(upper_key)
            };
          }
          temp_data[key].series[upper_key].data.push([timestamp, upper_value]);

          // Lower
          var lower_key = key + '_lower';
          var lower_value = timer_row.value.lower;
          if (!temp_data[key].series.hasOwnProperty(lower_key)) {
            // Create
            temp_data[key].series[lower_key] = {
              name: lower_key,
              data: [],
              color: self._colourForSeries(lower_key)
            };
          }
          temp_data[key].series[lower_key].data.push([timestamp, lower_value]);

          // Lower
          var percentile_key = key + '_90th_percentile_mean';
          var percentile_value = timer_row.value.pcts[0].value.mean;
          if (!temp_data[key].series.hasOwnProperty(percentile_key)) {
            // Create
            temp_data[key].series[percentile_key] = {
              name: percentile_key,
              data: [],
              color: self._colourForSeries(percentile_key)
            };
          }
          temp_data[key].series[percentile_key].data.push([timestamp, percentile_value]);
        }
      }
      this.transformedData = temp_data;
    }

    return this.transformedData;
  }
});