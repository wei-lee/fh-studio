model.Deploy = model.Model.extend({

  init: function() {
    this._super();
  },

  list: function(success, fail, post_process, params) {
    var url = '';
    params = (params != null ? params : {});

    url = Constants.LIST_APPS_URL;

    if (post_process != null) {
      return this.serverPost(url, params, success, fail, true, ($.isFunction(post_process) ? post_process : this.postProcessList), this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  create: function(params, success, fail) {
  },

  read: function(guid, success, fail, is_name) {
  },

  update: function(fields, success, fail) {
  },

  'delete': function(guid, success) {
  }
});