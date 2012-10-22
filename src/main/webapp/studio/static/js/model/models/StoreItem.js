model.StoreItem = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list: function(success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_LIST_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  create: function(name, item_id, description, auth_policies, groups, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_CREATE_URL;
    var params = {
      name: name,
      description: description,
      authToken: item_id,
      authpolicies: auth_policies,
      groups: groups
    };
    return this.serverPost(url, params, success, fail, true);
  },

  update: function(guid, name, item_id, description, auth_policies, groups, restrict_to_groups, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_UPDATE_URL;
    var params = {
      guid: guid,
      name: name,
      description: description,
      authToken: item_id,
      authpolicies: auth_policies,
      groups: groups,
      restrictToGroups: restrict_to_groups
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

  updateConfig: function(guid, type, bundle_id, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_UPDATE_CONFIG_URL;
    var params = {
      guid: guid,
      type: type,
      config: {bundle_id: bundle_id}
    };
    return this.serverPost(url, params, success, fail, true);
  }
});