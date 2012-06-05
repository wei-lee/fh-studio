
StateManager = function () {
  var self = {
    state_def: {},
    
    /*
     * Get the state for the given component id and state type/key
     */
    get: function (id, key, defval) {
      var state = 'undefined' === typeof defval ? null : defval;
      if (self.enabled) {
        if('object' === typeof self.state_def[id] && 'undefined' !== typeof self.state_def[id][key]){
          state = self.state_def[id][key];
        }
      }
      return state;
    },

    getAll: function() {
      return self.state_def;
    },
    
    set: function (id, key, value) {
      if (self.enabled) {
        if ('undefined' === typeof self.state_def[id]) {
          self.state_def[id] = {};
        }
        self.state_def[id][key] = value;
        self.persistState();
      }
    },
    
    /*
     * Persist the state to a cookie
     */
    persistState: function () {
      var stateKey;
      
      stateKey = self.getStateKey();
      
      $.cookie(stateKey, JSON.stringify(self.state_def))
    },
    
    getStateKey: function () {
      var userKey, stateKey;

      stateKey = '__fw_state_data__';      
      
      userKey = $.cookie('__fw_user_id__');
      if (userKey !== null) {
        stateKey += userKey;
      }
      
      return stateKey;
    },
    
    initState: function (props) {
      var stateKey;
      
      stateKey = self.getStateKey();
      
      var enabled = props['state-persistance'];
      self.enabled = 'true' === enabled;
      if (self.enabled) {
        var cookie = $.cookie(stateKey);
        if (cookie !== null) {
          try {
            self.state_def = JSON.parse(cookie);
          }
          catch (e) {
            alert('StateManager init failure:' + e);
          }
        }
      }
    }
  };

  return {
    get: self.get,
    getAll: self.getAll,
    set: self.set,
    initState: self.initState
  };
};

