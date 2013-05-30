App.Model.DomainActiveUsersPlatform = Backbone.Model.extend({
  initialize: function(options) {
    var name = options.name;

    // Mixin colors
    this.set('color', this._colourForKey(name));
    this.set('name', this._labelForKey(name));
  },

  _labelForKey: function(key) {
    var label_map = {
      "android": "Android",
      "iphone": "iPhone",
      "ipad": "iPad",
      "blackberry": "BlackBerry",
      "nokiawrt": "Nokia WRT",
      "windowsphone7": "Windows Phone 7",
      "wp7": "Windows Phone 7",
      "studio": "App Cloud IDE",
      "embed": "Web"
    };
    return label_map[key] || key;
  },

  _colourForKey: function(key) {
    if (key == 'windowsphone7' || key == 'wp7') {
      return "#fb9d00";
    } else if (key == 'blackberry') {
      return "#df3f1f";
    } else if (key == 'iphone') {
      return "#666666";
    } else if (key == 'android') {
      return "#7bb900";
    } else if (key == 'studio') {
      return '#3d96ae';
    } else if (key == 'ipad') {
      return '#aa4643';
    } else if (key == 'embed') {
      return '#4572a7';
    } else {
      var random_colours = ['#aa4643', '#89a54e', '#80699b', '#3d96ae', '#db843d'];
      var random_colour = random_colours[Math.floor(Math.random() * random_colours.length)];
      return random_colour;
    }
  }
});

App.Collection.DomainActiveUsersPlatform = App.Collection.Metrics.extend({
  model: App.Model.DomainActiveUsersPlatform,
  url: "/beta/static/mocks/metrics/domain_transactions_dest.json",
  metric: "domaintransactionsdest",

  initialize: function(collection, options) {
    this.picker_model = options.picker_model;
    App.Collection.Metrics.prototype.initialize.apply(this, arguments);
  },

  sync: function(method, model, options) {
    var url = 'box/srv/1.1/metrics/app/read';

    var params = {
      "id": $fw.clientProps.domain,
      "metric": this.metric,
      "from": this.dateParamsForDate(this.picker_model.get('from')),
      "to": this.dateParamsForDate(this.picker_model.get('to')),
      "type": "list",
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
    var res;
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

    // TODO: I think this can be done in one loop
    // Post process
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
    options.data = Backbone.Collection.prototype.toJSON.call(this);
    options.innerSize = '70%';
    options.showInLegend = true;
    return options;
  }
});