Stats.Model.Historical.Counters = Stats.Model.Historical.extend({
  /**
   * Model name is required, used by controller for mapping models and views
   */
  name: 'counters',

  init: function(params) {
    this._super(params);
  },

  _transform: function() {
    var self = this;
    var data = this.getData();
    var temp_data = {};

    // Aggregate keys
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var timestamp = new Date(row.ts).getTime();
      var counters = row.counters;

      for (var j = 0; j < counters.length; j++) {
        var counter_row = counters[j];
        var key = self._sanitizeSeriesName(counter_row.key);

        // Create base series objects
        if (!temp_data.hasOwnProperty(key)) {
          // Create
          
          temp_data[key] = {
            name: key,
            series: {}
          };
        }

        // Series
        if (!temp_data[key].series.hasOwnProperty(key)) {
          // Create
          temp_data[key].series[key] = {
            name: key,
            data: [],
            color: self._colourForSeries(key)
          };
        }
        var value = counter_row.value.value;
        temp_data[key].series[key].data.push([timestamp, value]);
      }
    }

    return temp_data;
  }
});