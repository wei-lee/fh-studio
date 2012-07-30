model.StoreItemConsumer = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list: function(success, fail) {
    var MAM_STORE_ITEMS_URL = '/box/srv/1.1/mas/appstore/getstoreitems';
    var params = {};
    return this.serverPost(MAM_STORE_ITEMS_URL, params, success, fail);   
  }
});