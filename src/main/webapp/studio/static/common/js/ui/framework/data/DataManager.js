
DataManager = function () {
  var self = {
    data: {},
        
    /*
     * Get the data for the given key
     */
    get: function (key) {
      return self.data[key];
    },
    
    /*
     * Set the data value for the given key
     */ 
    set: function (key, value) {
      self.data[key] = value;
    },
    
    remove: function (key) {
      self.data[key] = undefined;
    },
    
    getDataStore: function () {
      return self.data;
    },
    
    setDataStore: function (store) {
      self.data = store;
    },
    
    init: function () {
    }
  };
  
  self.init();

  return {
    getDataStore: self.getDataStore,
    setDataStore: self.setDataStore,
    get: self.get,
    set: self.set,
    remove: self.remove
  };
};