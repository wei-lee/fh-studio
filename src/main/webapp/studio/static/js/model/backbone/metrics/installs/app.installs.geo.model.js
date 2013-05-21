App.Model.AppInstallsGeo = Backbone.Model.extend({});

App.Collection.AppInstallsGeo = Backbone.Collection.extend({
  model: App.Model.AppInstallsGeo,

  url: "/beta/static/mocks/metrics/app_installs_geo.json",

  sync: function(method, model, options) {
    var url = '/box/srv/1.1/ide/testing-df/app/getsingleappmetrics';

    // TODO: Endpoint accepts widget ID rather than template instance. Why?
    var params = {
      "id": $fw.data.get('app').guid,
      "metric": "appinstallsgeo",
      "from": {
        "year": "2013",
        "month": "4",
        "date": "21"
      },
      "to": {
        "year": "2013",
        "month": "5",
        "date": "21"
      },
      "type": "geo",
      "num": 0
    };

    if ("read" === method) {
      $fw.server.post(url, params, function(res) {
        if (res.status === "ok") {
          if ($.isFunction(options.success)) {
            options.success(res);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res);
          }
        }
      }, options.error, true);
    } else {
      console.log("EventLog collection do not support" + method);
      if ($.isFunction(options.error)) {
        options.error(model, "not_supported", options);
      }
    }
  },

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