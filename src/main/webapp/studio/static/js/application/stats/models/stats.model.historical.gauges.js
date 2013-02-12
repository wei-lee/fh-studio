Stats.Model.Historical.Gauges = Stats.Model.Historical.extend({

  name:"Gauges",
  init: function(params){
    this._super(params);

    this.use_sample_data = 'true' === $fw.getClientProp('live-app-resource-sampledata-enabled');
  },

  _transform: function() {
    var self = this;

    if (this.transformedData == null) { // TODO: revisit if using filters
      console.log('transforming data');
      var data = this.getData();
      var temp_data = {};

      // Aggregate keys
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var timestamp = new Date(row.ts).getTime();
        var gauges = row.gauges;

        for (var j = 0; j < gauges.length; j++) {
          var gauge_row = gauges[j];
          var key = self._sanitizeSeriesName(gauge_row.key);

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
          var value = gauge_row.value;
          temp_data[key].series[key].data.push([timestamp, value]);
        }
      }
      this.transformedData = temp_data;
    }

    return this.transformedData;
  },

  _initMockData: function(opts){
    this._super({
      gauges:{key: 'testid-dev_app_Memory'}
    });
  }
});