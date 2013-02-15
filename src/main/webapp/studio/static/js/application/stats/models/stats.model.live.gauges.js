Stats.Model.Live.Gauges = Stats.Model.Live.extend({

  name:"Gauges",

  init: function(params){
    this._super(params);

    this.use_sample_data = 'true' === $fw.getClientProp('live-app-resource-sampledata-enabled');
  },

  _transform: function() {
    var self = this;

    console.log('transforming data');
    var data = this.getData();
    console.log("data length is " + data.length);

    this.transformedData = self._convertData(data);
    console.log(this.transformedData);

    return this.transformedData;
  },

  _convertData: function(data){
    var self = this;
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
      if(i === data.length - 1){
        self.last_updated = row.ts;
      }
    }
    return temp_data;
  },

  _initMockData: function(opts){
    this._super({
      gauges:[{key: 'testid-dev_resources_Cpu_Pct', min: 0, max: 100}, {key:'testid-dev_resources_VmRSS', min: 1000, max: 100000}, {key:'testid-dev_resources_Disk', min:1000, max:100000}]
    });
  },

  _sanitizeSeriesName: function(series_name) {
    var split_name = series_name.split("_resources_");

    if (split_name.length > 1) {
      return split_name[1];
    } else {
      return split_name[0];
    }
  }
});