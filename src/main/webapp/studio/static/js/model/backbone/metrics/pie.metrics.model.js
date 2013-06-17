// Base class for Metrics collections/models
// Pie charts are handled differently in Highcharts (yay!)
// New Pie chart collections/models should inherit from here
// 
// There are two types:
// 
// PieMetrics (per-app)
// DomainPieMetrics (per-domain)
// 
// These are mostly similar, but with a different endpoint/params
// Post processing is the same, though

App.Model.PieMetric = Backbone.Model.extend({
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
      "ios": "iOS",
      "windowsphone7": "Windows Phone 7",
      "wp7": "Windows Phone 7",
      "studio": "App Studio",
      "embed": "Web",
      "fhc": "FHC"
    };

    if (key === '') key = "Other";
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
    } else if (key == 'ios') {
      return '#484848';
    } else if (key == 'embed') {
      return '#4572a7';
    } else if (key == 'fhc') {
      return '#492970';
    } else if (key === '') {
      // Other
      return '#db843d';
    } else {
      var random_colours = ['#aa4643', '#80699b', '#db843d', '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'];
      var random_colour = random_colours[Math.floor(Math.random() * random_colours.length)];
      return random_colour;
    }
  }
});

App.Collection.PieMetrics = App.Collection.Metrics.extend({
  model: App.Model.PieMetric,
  url: null,
  metric: null,

  getSubtitle: function() {
    var from = App.picker_from;
    var to = App.picker_to;
    var total = this.getTotal();
    return from.format("DD/MM/YY") + " - " + to.format("DD/MM/YY") + "    Total: " + total;
  },

  getTotal: function() {
    var total = 0;
    $.each(this.models, function(i, model) {
      var value = model.get('y');
      total = total + value;
    });

    return total;
  },

  initialize: function(collection, options) {
    this.picker_model = options.picker_model;
    App.Collection.Metrics.prototype.initialize.apply(this, arguments);
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

    // Make Doughnut
    options.innerSize = '60%';
    options.showInLegend = true;
    return options;
  }
});

App.Collection.DomainPieMetrics = App.Collection.PieMetrics.extend({
  // Custom sync - domain metrics use a different endpoint
  sync: function(method, model, options) {
    if ($fw.getClientProp('reporting-sampledata-enabled') === 'true') {
      // Use mocks - use generic sync (this.url will be location of static mock)
      return Backbone.Collection.prototype.sync.apply(this, arguments);
    }

    var url = 'box/srv/1.1/metrics/app/read';
    var params = {
      "id": $fw.clientProps.domain,
      "metric": this.metric,
      "from": this.dateParamsForDate(this.picker_model.get('from')),
      "to": this.dateParamsForDate(this.picker_model.get('to'))
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
  }
});