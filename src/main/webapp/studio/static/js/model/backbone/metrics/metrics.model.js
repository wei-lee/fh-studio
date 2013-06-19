// Base class from metrics calls since sync 
// calls for metrics endpoints are very similar

App.Collection.Metrics = Backbone.Collection.extend({
  metric: null,

  initialize: function(collection, options) {
    var self = this;
    this.guid = options.guid;

    // React to date changes on picker model
    this.picker_model = options.picker_model;
    this.picker_model.on('change', function() {
      self.fetch();
    }, this);
  },

  getSubtitle: function() {
    var from = App.picker_from;
    var to = App.picker_to;
    var total = this.getTotal();
    return from.format("DD/MM/YY") + " - " + to.format("DD/MM/YY") + "    Total: " + total;
  },

  getTotal: function() {
    var total = 0;

    $.each(this.models, function(i, model) {
      $.each(model.get('data'), function(i, data_point) {
        var value = data_point[1];
        total = total + value;
      });
    });

    return total;
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
    if ($fw.getClientProp('reporting-sampledata-enabled') === 'true') {
      // Use mocks - use generic sync (this.url will be location of static mock)
      return Backbone.Collection.prototype.sync.apply(this, arguments);
    }

    var url = '/box/srv/1.1/ide/' + $fw.clientProps.domain + '/app/getsingleappmetrics';

    // TODO: Endpoint accepts widget ID rather than template instance. Why?
    var params = {
      "id": this.guid || $fw.data.get('app').guid,
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
      "embed": "Embed",
      "mobile": "Mobile Web",
      "web": "Web",
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
    } else if (key == 'web') {
      return '#92A8CD';
    } else if (key == 'mobile') {
      return '#80699B';
    }else if (key === '') {
      // Other
      return '#db843d';
    } else {
      var random_colours = ['#aa4643', '#80699b', '#db843d', '#4572A7', '#AA4643', '#89A54E', '#3D96AE', '#DB843D', '#A47D7C', '#B5CA92'];
      var random_colour = random_colours[Math.floor(Math.random() * random_colours.length)];
      return random_colour;
    }
  }
});


// Domain analytics use a different endpoint
App.Collection.DomainMetrics = App.Collection.Metrics.extend({
  sync: function(method, model, options) {
    if ($fw.getClientProp('reporting-sampledata-enabled') === 'true') {
      // Use mocks - use generic sync (this.url will be location of static mock)
      return Backbone.Collection.prototype.sync.apply(this, arguments);
    }

    var url = '/box/srv/1.1/metrics/app/read';

    // TODO: Endpoint accepts widget ID rather than template instance. Why?
    var params = {
      "id": this.guid || $fw.clientProps.domain,
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