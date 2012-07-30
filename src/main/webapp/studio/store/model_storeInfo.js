

model.StoreInfo = model.Model.extend({
  // Model config
  config: {},

  init: function() {},

  getInfo: function(success, fail) {
    var MAM_STORE_INFO_URL = '/box/srv/1.1/mas/appstore/read';
    var params = {};
    return this.serverPost(MAM_STORE_INFO_URL, params, success, fail);
  },
});