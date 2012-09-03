model.Deploy = model.Model.extend({

  init: function() {
    this._super();
  },

  list: function(app_guid, env, success, fail) {
    var url = Constants.DEPLOY_TARGETS_LIST;
    var params = {
      app: app_guid,
      env: env
    };
    return this.serverPost(url, params, success, fail, true);
  },

  create: function(params, success, fail) {},

  read: function(guid, success, fail, is_name) {},

  update: function(fields, success, fail) {},

  remove: function(guid, success) {}
});