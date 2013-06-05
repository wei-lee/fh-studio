App.Model.AppStartupsDate = Backbone.Model.extend({});

App.Collection.AppStartupsDate = App.Collection.Metrics.extend({
  model: App.Model.AppStartupsDate,
  metric: "appstartupsdest",
  url: "/beta/static/mocks/metrics/app_startups_date.json",

  parse: function(response) {
    var self = this;
    var parsed = [];
    var values = {};

    var data = response.payload.results;

    _.each(data, function(row) {
      var ts = row._id.ts;
      _.each(row.value, function(v, k) {
        if (!_.has(values, k)) {
          values[k] = {
            data: []
          };
        }
        values[k].data.push([ts, v]);
      });
    });

    // Post process, push individual series
    _.each(values, function(v, k) {
      var series = {
        name: self._labelForKey(k),
        data: v.data,
        color: self._colourForKey(k)
      };
      parsed.push(series);
    });

    // Sort by timestamp
    _.each(parsed, function(item) {
      var unsorted_data = item.data;
      var sorted_data = _.sortBy(unsorted_data, function(d) {
        // ts
        return d[0];
      });
      item.data = sorted_data;
    });
    
    return parsed;
  }
});