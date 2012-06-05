var Stats = Stats || {};
Stats.Model = Stats.Model || {}

/**
 * Basic stats model - models stats in their
 * raw form, untransformed
 */
Stats.Model.Base = Class.extend({
  _mock: null,
  _revisions: [],
  _data: null,
  use_sample_data: false,
  use_mock_delay: true,
  errors: null,
  name: null,
  filters: {
    filterDate: function(params) {
      // Params data object is a clone, we'll push 
      // this onto the history stack when we're done
      var data = this.getData();
      var to = params.to;
      var from = params.from;
      var tmp_data = [];

      // Data is an array at the top level
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        if (row.hasOwnProperty('ts')) {
          // Check timestamp
          if (this._dateBetween(from, to, new Date(row.ts))) {
            tmp_data.push(row);
          }
        }
      }

      this._pushData(tmp_data);
      return data;
    }
  },

  init: function(params) {
    if (!params) {
      var params = {};
    }

    this.deploy_target = params.deploy_target || 'live';

    // Use sample data?
    this.use_sample_data = 'true' === $fw.getClientProp('stats-sampledata-enabled');

    // Auto load models?
    if (params.auto_load) {
      this.load(params);
    }
  },

  load: function(params) {
    var params = params || {};
    if (this.use_sample_data) {
      // Use mock
      this._loadMock(function(res) {
        if (typeof(params.loaded) == 'function') {
          params.loaded(res);
        };
      });
    } else {
      // Remote call
      this._loadRemote(function(res) {
        if (typeof(params.loaded) == 'function') {
          params.loaded(res);
        };
      });
    }
  },

  getData: function() {
    var data = this._revisions;

    if (data.length > 0) {
      return data[data.length - 1]
    } else {
      return null;
    }
  },

  clearFilter: function() {
    if (this._revisions.length > 1) {
      this._revisions.pop();
    }
  },

  applyFilter: function(params) {
    // { name: 'filterDate', from: new Date(), to: new Date() }
    // Remove existing filter
    this.clearFilter();

    // Find filter
    var filter = this.filters[params.name];

    if (!filter) {
      throw new Error("No filter called [" + params.name + "] found.");
    }

    // Call filter
    return filter.call(this, params);
  },

  _pushData: function(data) {
    this._revisions.push(data);
  },

  _setInitialData: function(data) {
    this._data = data;
    this._pushData(this._clone(this._data));
  },

  _loadMock: function(callback) {
    this._setInitialData(this._mock);
    if (typeof(callback) == 'function') {
      if (this.use_mock_delay) {
        setTimeout(function(){
          callback({status: 'ok'});
        }, 500);
      } else {
        callback({status: 'ok'});
      }      
    };
  },

  _loadRemote: function(callback) {
    // this._loadMock(callback);
    var url, params, app;
    var self = this;

    var guid = $fw_manager.data.get('inst').guid;
    url = Constants.STATS_APP_URL;
    params = {
      guid: guid,
      deploytarget: this.deploy_target,
      statstype: 'app',
      count: 360
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self._setInitialData(res.results);
        callback(res);
      } else {
        callback(res);
      }
    });
  },

  _keys: function(obj) {
    var keys = [];
    for (var i in obj) if (obj.hasOwnProperty(i)) {
      keys.push(i);
    }
    return keys;
  },

  _clone: function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      var copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      var copy = [];
      for (var i = 0, len = obj.length; i < len; ++i) {
        copy[i] = this._clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      var copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this._clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  },

  _dateBetween: function(from, to, date) {
    var b, e, c;
    b = from.getTime();
    e = to.getTime();
    c = date.getTime();
    if ((c <= e && c >= b)) {
      return true;
    }
    return false;
  },

  _labelForKey: function(key) {
    var label_map = {};
    var key = label_map[key] || key;
    return key;
  },

  _colourForSeries: function(key) {
    var colour_map = {};
    return colour_map[key] || null;
  }
});