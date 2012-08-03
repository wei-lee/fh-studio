model.AppStore = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  read: function(success, fail) {
    var url = Constants.ADMIN_APP_STORE_READ_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  update: function(guid, name, description, store_items, auth_policies, success, fail) {
    var url = Constants.ADMIN_APP_STORE_UPDATE_URL;
    var params = {
      guid: guid,
      name: name,
      description: description,
      storeitems: store_items,
      authpolicies: auth_policies
    };
    return this.serverPost(url, params, success, fail, true);
  }
});