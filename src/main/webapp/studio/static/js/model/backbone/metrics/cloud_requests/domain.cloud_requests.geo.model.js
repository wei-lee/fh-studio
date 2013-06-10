App.Model.DomainCloudRequestsGeo = Backbone.Model.extend({});

App.Collection.DomainCloudRequestsGeo = App.Collection.DomainMetrics.extend({
  model: App.Model.DomainCloudRequestsGeo,
  metric: "domainrequestsgeo",
  url: "/studio/static/js/model/mocks/metrics/domain_requests_geo.json",
  
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
    data.push(['Country', 'Installs']);

    _.each(this.models, function(model) {
      data.push([model.get('name'), model.get('y')]);
    });

    return data;
  }
});