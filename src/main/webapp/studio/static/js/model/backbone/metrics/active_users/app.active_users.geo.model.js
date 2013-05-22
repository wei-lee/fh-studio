App.Model.AppActiveUsersGeo = Backbone.Model.extend({});

App.Collection.AppActiveUsersGeo = App.Collection.Metrics.extend({
  model: App.Model.AppActiveUsersGeo,
  metric: "apptransactionsgeo",
  url: "/beta/static/mocks/metrics/app_active_users_geo.json",

  parse: function(response) {
    var self = this;
    var parsed = [];
    var values = {};

    var data = response.payload.results;
    _.each(data, function(row) {
      _.each(row.value, function(v, k) {
        if (!_.has(values, k)) {
          values[k] = 0;
        }
        values[k] = values[k] + v;
      });
    });

    _.each(values, function(v, k) {
      parsed.push({
        y: v,
        name: k
      });
    });
    return parsed;
  },

  toJSON: function() {
    var options = _.clone(this.options) || {};
    options = Backbone.Collection.prototype.toJSON.call(this);
    return options;
  },

  toArray: function() {
    var data = [];
    data.push(['Country', 'Active Users']);

    _.each(this.models, function(model) {
      data.push([model.get('name'), model.get('y')]);
    });

    return data;
  }
});