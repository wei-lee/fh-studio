application.DataLocator = Class.extend({
  
  init: function () {
    
  },
  
  /*
   * Get the data for the specified data id
   */
  getData: function (params, type, success, fail) {
    console.log('getData not implemented for subclass of DataLocator');
    fail.call();
  }
  
});
