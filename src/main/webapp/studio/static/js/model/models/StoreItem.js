model.StoreItem = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list: function(success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_LIST_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  create: function(name, item_id, description, auth_policies, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_CREATE_URL;
    var params = {
      name: name,
      description: description,
      authToken: item_id,
      auth_policies: auth_policies
    };
    return this.serverPost(url, params, success, fail, true);
  },

  update: function(guid, name, item_id, description, auth_policies, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_UPDATE_URL;
    var params = {
      guid: guid,
      name: name,
      description: description,
      authToken: item_id,
      auth_policies: auth_policies
    };
    return this.serverPost(url, params, success, fail, true);
  },

  remove: function(guid, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_DELETE_URL;
    var params = {
      "guid": guid
    };
    return this.serverPost(url, params, success, fail, true);
  },

  updateConfig: function(guid, type, config, success, fail) {
    // {
    //   "guid": "<store_item_guid>",
    //   "type": "<ios|ipad|iphone|android>",
    //   "config": {
    //     "<config_key>": "<config_value>"
    //   }
    // }

    var url = Constants.ADMIN_STORE_ITEM_UPDATE_CONFIG_URL;
    var params = {
      guid: guid,
      type: type,
      config: config
    };
    return this.serverPost(url, params, success, fail, true);
  }
});