// Base class from metrics calls since sync 
// calls for metrics endpoints are very similar

App.Collection.Metrics = Backbone.Collection.extend({
  from: null,
  to: null,
  metric: null,

  initialize: function(options) {
    var self = this;

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
    var url = '/box/srv/1.1/ide/' + $fw.clientProps.domain + '/app/getsingleappmetrics';

    // If from & to explicitly passed in a fetch(), set and use them
    if (options.from) {
      this.from = options.from;
    }

    if (options.to) {
      this.to = options.to;
    }

    // TODO: Endpoint accepts widget ID rather than template instance. Why?
    var params = {
      "id": $fw.data.get('app').guid,
      "metric": this.metric,
      "from": this.dateParamsForDate(this.from),
      "to": this.dateParamsForDate(this.to),
      "type": "pie",
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
    } else if (key == 'embed') {
      return '#4572a7';
    } else {
      var random_colours = ['#aa4643', '#89a54e', '#80699b', '#3d96ae', '#db843d'];
      var random_colour = random_colours[Math.floor(Math.random() * random_colours.length)];
      return random_colour;
    }
  }
});