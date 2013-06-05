App.Model.DomainStartupsDate = Backbone.Model.extend({});

App.Collection.DomainStartupsDate = App.Collection.DomainMetrics.extend({
  model: App.Model.DomainStartupsDate,
  metric: "domainstartupsdest",
  url: "/beta/static/mocks/metrics/domain_statups_date.json",

  parse: function(response) {
    var data = response.payload.results;

    if (this.total) {
      return this.parseTotal(data);
    } else {
      return this.parseMultiSeries(data);
    }
  },

  parseTotal: function(data) {
    var self = this;

    // k: timestamp
    // v: accumulated values for ts
    var values = {};
    var parsed = [];

    _.each(data, function(row) {
      var ts = row._id.ts;
      if (!_.has(values, ts)) {
        values[ts] = {
          total: 0
        };
      }

      _.each(row.value, function(v, k) {
        values[ts].total = v + values[ts].total;
      });
    });

    var series = {
      name: 'Total',
      data: []
    };
    parsed.push(series);

    _.each(values, function(v, k) {
      parsed[0].data.push([parseInt(k, 10), v.total]);
    });

    return parsed;
  },

  parseMultiSeries: function(data) {
    var self = this;
    var parsed = [];
    var values = {};

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

    // Post process
    _.each(values, function(v, k) {
      var series = {
        name: self._labelForKey(k),
        data: v.data,
        color: self._colourForKey(k)
      };
      parsed.push(series);
    });

    return parsed;
  },

  toJSON: function() {
    var options = _.clone(this.options) || {};
    options = Backbone.Collection.prototype.toJSON.call(this);
    return options;
  }
});