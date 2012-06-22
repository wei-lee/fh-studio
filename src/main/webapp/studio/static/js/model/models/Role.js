model.Role = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list_assignable: function(success, fail) {
    var url = Constants.ADMIN_ROLE_LIST_ASSIGNABLE_URL;
    var params = {};

    return this.serverPost(url, params, success, fail, true);
  }

});