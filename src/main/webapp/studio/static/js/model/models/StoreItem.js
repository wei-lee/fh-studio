model.StoreItem = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list: function(success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_LIST_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  create: function(name, item_id, description, groups, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_CREATE_URL;
    var params = {
      name: name,
      description: description,
      authToken: item_id,
      groups: groups
    };
    return this.serverPost(url, params, success, fail, true);
  },

  remove: function(guid, success, fail) {
    var url = Constants.ADMIN_STORE_ITEM_DELETE_URL;
    var params = {
      "guid": guid
    };
    return this.serverPost(url, params, success, fail, true);
  }
});