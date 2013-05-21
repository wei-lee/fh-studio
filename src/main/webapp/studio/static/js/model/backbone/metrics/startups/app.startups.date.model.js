App.Model.AppStartupsDate = Backbone.Model.extend({});

App.Collection.AppStartupsDate = Backbone.Collection.extend({
  model: App.Model.AppStartupsDate,

  url: "/beta/static/mocks/metrics/app_startups_date.json",

  parse: function(response) {
    var self = this;
    var parsed = [];
    var values = {};

    var data = response.payload.results;

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

    // Post process, push individual series
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