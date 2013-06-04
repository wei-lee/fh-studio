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
    var from = App.models.datepicker.from();
    var to = App.models.datepicker.to();
    var total = this.getTotal();
    return from.format("DD/MM/YY") + " - " + to.format("DD/MM/YY") + "    Total: " + total;
  },

  getTotal: function() {
    var total = 0;

    $.each(this.models, function(i, model) {
      $.each(model.get('data'), function(i, data_point){
        var value = data_point[1];
        total = total + value;
      })

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
    var url = '/box/srv/1.1/ide/' + $fw.clientProps.domain + '/app/getsingleappmetrics';

    // TODO: Endpoint accepts widget ID rather than template instance. Why?
    var params = {
      "id": this.guid || $fw.data.get('app').guid,
      "metric": this.metric,
      "from": this.dateParamsForDate(this.picker_model.get('from')),
      "to": this.dateParamsForDate(this.picker_model.get('to')),
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
    } else if (key == 'embed') {
      return '#4572a7';
    } else if (key == 'fhc') {
      return '#89a54e';
    } else if (key === '') {
      // Other
      return '#db843d';
    } else {
      var random_colours = ['#aa4643', '#80699b', '#db843d'];
      var random_colour = random_colours[Math.floor(Math.random() * random_colours.length)];
      return random_colour;
    }
  }
});