App.Model.AppInstallsDate = Backbone.Model.extend({});

App.Collection.AppInstallsDate = Backbone.Collection.extend({
  model: App.Model.AppInstallsDate,

  url: "/beta/static/mocks/metrics/app_installs_date.json",

  from: null,
  to: null,

  initialize: function(options) {
    var self = this;

    if (options) {
      this.total = options.total || false;
    } else {
      this.total = false;
    }

    // React to datepicker date changes
    App.vent.on('app-analytics-datechange', function(e) {
      self.from = e.from;
      self.to = e.to;
      self.fetch();
    });
  },

  dateParamsForDate: function(date) {
    if (!date) {
      return console.log('No date input');
    }

    // Months are 0-indexed
    var ret = {
      date: date.date(),
      month: date.month() + 1,
      year: date.year()
    };

    return ret;
  },

  sync: function(method, model, options) {

    // If from & to explicitly passed in a fetch(), set and use them
    if (options.from) {
      this.from = options.from;
    }

    if (options.to) {
      this.to = options.to;
    }

    var url = '/box/srv/1.1/ide/testing-df/app/getsingleappmetrics';

    // TODO: Endpoint accepts widget ID rather than template instance. Why?
    var params = {
      "id": $fw.data.get('app').guid,
      "metric": "appinstallsdest",
      "from": this.dateParamsForDate(this.from),
      "to": this.dateParamsForDate(this.to),
      "type": "line",
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