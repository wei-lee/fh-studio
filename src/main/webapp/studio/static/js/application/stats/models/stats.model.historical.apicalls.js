Stats.Model.Historical.APICalls = Stats.Model.Historical.extend({
  /**
   * Model name is required, used by controller for mapping models and views
   */
  name: 'apicalls',

  _mock: Stats.Mock.apicalls.results,

  init: function(params) {
    this._super(params);
  },

  _transform: function () {
    var self = this;

    if (this.transformedData == null) { // TODO: revisit if using filters
      console.log('transforming data');
      var data = this.getData();
      var temp_data = {};
      var upper_key_name = Lang['stats_apicalls_request_times_upper'];
      var lower_key_name = Lang['stats_apicalls_request_times_lower'];
      var percentile_key_name = Lang['stats_apicalls_request_times_90th_percentile_mean'];
      var average_concurrent_key_name = Lang['stats_apicalls_requests_average_concurrent'];
      var req_num_key_name = Lang['stats_apicalls_requests_number'];
      var active_req_key_name = Lang['stats_apicalls_requests_active'];
      var req_num_key; // need this outside of loop as it's a special key. The corresponding series could be initialised inside counters or timers

      // needed for numRequests so 0 requests are shown too
      var zeroedTimestamps = [];

      // upper, lower, pcts[0].value.mean, count(num req.)
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var timestamp = new Date(row.ts).getTime();
        var timers = row.timers;
        var counters = row.counters;

        var key;

        // pull out active requests
        // for (var ci = 0, cl = counters.length; ci < cl; ci += 1) {
        //   var counter_row = counters[ci];
        //   key = self._sanitizeSeriesName(counter_row.key);

        //   // Create base series objects
        //   if (!temp_data.hasOwnProperty(key)) {
        //     // Create
        //     temp_data[key] = {
        //       name: key,
        //       series: {}
        //     };
        //   }

        //   // active requests
        //   var active_req_key = key + '_active_requests';
        //   var active_req_value = counter_row.value.value;
        //   if (!temp_data[key].series.hasOwnProperty(active_req_key)) {
        //     // Create
        //     temp_data[key].series[active_req_key] = {
        //       yAxis: 1,
        //       order: 5,
        //       name: active_req_key_name,
        //       data: _.clone(zeroedTimestamps),
        //       color: self._colourForSeries(active_req_key),
        //       visible: false,
        //       fh_zeroes: true
        //     };
        //   }
        //   temp_data[key].series[active_req_key].data.push([timestamp, active_req_value]);

        //   //initialise numRequests up here so that we get a series for it, even if all zeroes
        //   req_num_key = key + '_numRequests';
        //   if (!temp_data[key].series.hasOwnProperty(req_num_key)) {
        //     // Create
        //     temp_data[key].series[req_num_key] = {
        //       yAxis: 1,
        //       order: 1,
        //       name: req_num_key_name,
        //       data: _.clone(zeroedTimestamps),
        //       color: self._colourForSeries(req_num_key),
        //       fh_zeroes: true
        //     };
        //   }
        // }

        // pull out average/min/max times, and derive num requests and average number of concurrent requests
        for (var ji = 0, jl = timers.length; ji < jl; ji++) {
          var timer_row = timers[ji];
          // Base Key
          key = self._sanitizeSeriesName(timer_row.key);

          // Create base series objects
          if (!temp_data.hasOwnProperty(key)) {
            // Create
            temp_data[key] = {
              name: key,
              series: {}
            };
          }

          // num requests
          req_num_key = key + '_numRequests';
          var intervalMS = self.interval;
          var periodMS = 1000; // 1 second
          var req_num_value = Math.round((timer_row.value.count * (periodMS / intervalMS)) * 100) / 100;
          if (!temp_data[key].series.hasOwnProperty(req_num_key)) {
            temp_data[key].series[req_num_key] = {
              yAxis: 1,
              order: 1,
              name: req_num_key_name,
              data: _.clone(zeroedTimestamps),
              color: self._colourForSeries(req_num_key),
              fh_zeroes: true
            };
          }
          temp_data[key].series[req_num_key].data.push([timestamp, req_num_value]);

          // Mean
          var percentile_key = key + '_90th_percentile_mean';
          var percentile_value = (Math.round(timer_row.value.pcts[0].value.mean * 100) / 100); // precision 2
          if (!temp_data[key].series.hasOwnProperty(percentile_key)) {
            // Create
            temp_data[key].series[percentile_key] = {
              yAxis: 0,
              order: 12,
              name: percentile_key_name,
              data: _.clone(zeroedTimestamps),
              fh_zeroes: true,
              color: self._colourForSeries(percentile_key)
            };
          }
          temp_data[key].series[percentile_key].data.push([timestamp, percentile_value]);

          // derived value of average number of concurrent requests in this period
          //  using percentile mean and num requests from above
          var average_concurrent_key = key + '_average_concurrent';
          var average_concurrent_value = (Math.round(((percentile_value * timer_row.value.count) / self.interval) * 100) / 100); // precision 2
          if (!temp_data[key].series.hasOwnProperty(average_concurrent_key)) {
            // Create
            temp_data[key].series[average_concurrent_key] = {
              yAxis: 1,
              order: 7,
              name: average_concurrent_key_name,
              data: _.clone(zeroedTimestamps),
              color: self._colourForSeries(average_concurrent_key),
              fh_zeroes: true
            };
          }
          temp_data[key].series[average_concurrent_key].data.push([timestamp, average_concurrent_value]);

          // Upper
          var upper_key = key + '_upper';
          var upper_value = timer_row.value.upper;
          if (!temp_data[key].series.hasOwnProperty(upper_key)) {
            // Create
            temp_data[key].series[upper_key] = {
              yAxis: 0,
              order: 15,
              name: upper_key_name,
              data: _.clone(zeroedTimestamps),
              fh_zeroes: true,
              color: self._colourForSeries(upper_key),
              visible: false
            };
          }
          temp_data[key].series[upper_key].data.push([timestamp, upper_value]);

          // Lower
          var lower_key = key + '_lower';
          var lower_value = timer_row.value.lower;
          if (!temp_data[key].series.hasOwnProperty(lower_key)) {
            // Create
            temp_data[key].series[lower_key] = {
              yAxis: 0,
              order: 20,
              name: lower_key_name,
              data: _.clone(zeroedTimestamps),
              fh_zeroes: true,
              color: self._colourForSeries(lower_key),
              visible: false
            };
          }
          temp_data[key].series[lower_key].data.push([timestamp, lower_value]);
        }
        
        zeroedTimestamps.push([timestamp, 0]);

        // add zeros with timestamp for num requests of any act calls that don't have timer this timestamp
        for (var tkey in temp_data) {
          var tseries = temp_data[tkey].series;
          for (var rkey in tseries) {
            if (tseries[rkey].fh_zeroes) {
              var rdata = tseries[rkey].data;
              if (rdata.length < zeroedTimestamps.length) {
                rdata.push([timestamp, 0]);
              }
            }
          }
        }
      }
      this.transformedData = temp_data;
    }

    return this.transformedData;
  },

  _sanitizeSeriesName: function(series_name) {
    var sanitizedName = series_name;

    var m1 = series_name.match(/\b(.*)_active_requests\b/);
    if (m1 != null) {
        sanitizedName = m1[1];
    } else {
      var m2 = series_name.match(/\b(.*)_request_times\b/);
      if (m2 != null) {
        sanitizedName = m2[1];
      }
    }

    //console.log('_sanitizeSeriesName: ' + series_name + ' => ' + sanitizedName);

    return sanitizedName;
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

    // sort series
    series_data.all_series = _.sortBy(series_data.all_series, function (tempSeries) {
      return tempSeries.order;
    });

    return series_data;
  }
});