model.AppStore = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  read: function(success, fail) {
    var url = Constants.ADMIN_APP_STORE_READ_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  update: function(success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_UPDATE_URL;
    var params = {};
    return this.serverPost(url, params, success, fail, true);
  }
});