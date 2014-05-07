model.App = model.Model.extend({

  // Field config
  field_config: [{
    field_name: "icon",
    column_title: ""
  }, {
    field_name: "title",
    column_title: "Name"
  }, {
    field_name: "description",
    column_title: "Description"
  }, {
    field_name: "email",
    visible: true,
    column_title: "Email"
  }, {
    field_name: "version",
    column_title: "Version",
    width: "60px"
  }, {
    field_name: "modified",
    column_title: "Last Modified",
    width: "150px"
  }, {
    field_name: "id",
    visible: false,
    column_title: "App ID"
  }],

  recent_field_config: [{
    field_name: "icon",
    column_title: ""
  }, {
    field_name: "title",
    column_title: "Name"
  }, {
    field_name: "version",
    column_title: "Version",
    width: "60px"
  }, {
    field_name: "modified",
    column_title: "Last Modified",
    width: "150px"
  }, {
    field_name: "id",
    visible: false,
    column_title: "App ID"
  }],

  init: function() {
    this._super();
  },

  listAll: function(success, fail, post_process) {
    var params = {};
    return this.list(success, fail, post_process, params);
  },

  listMyApps: function(success, fail, post_process) {
    var params = {
      "myapps": true
    };
    return this.list(success, fail, post_process, params);
  },

  listRecent: function(success, fail) {
    var self = this;

    var params = {
      "max": 5,
      "order": "desc",
      "order-by": "sysModified"
    };
    return this.list(success, fail, function(res, data_model) {
      return self.postProcessList(res, data_model, self.recent_field_config);
    }, params);
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
    var url = Constants.CREATE_APP_URL;
    $fw.server.post(url, params, function(result) {
      if (result.status === 'ok') {
        if ($.isFunction(success)) {
          success(result);
        }
      } else {
        if ($.isFunction(fail)) {
          fail(result);
        }
      }
    });
  },

  read: function(guid, success, fail, is_name) {
    var url = is_name ? Constants.READ_APP_BY_NAME_URL : Constants.READ_APP_URL;
    var params = {};
    if (is_name) {
      params.appName = guid;
    } else {
      params.guid = guid;
    }
    $fw.server.post(url, params, function(result) {
      if (result.status && 'error' === result.status) {
        if ('function' === typeof fail) {
          fail(result.message);
        }
      } else {
        if ('function' === typeof success) {
          success(result);
        }
      }
    }, function(error) {
      if ('function' === typeof fail) {
        fail(error);
      }
    });
  },

  update: function(fields, success, fail) {
    console.log('App.update');
    var url = Constants.UPDATE_APP_URL;
    var params = fields;
    // TODO: error callback should also happen if update failed, not just if status wasn't 200
    $fw.server.post(url, params, function(result) {
      if (result.status && 'error' === result.status) {
        if ('function' === typeof fail) {
          fail(result.message);
        }
      } else {
        if ('function' === typeof success) {
          success(result);
        }
      }
    }, function(error) {
      if ('function' === typeof fail) {
        fail(error);
      }
    });
  },

  'delete': function(guid, success) {
    var url = Constants.DELETE_APP_URL;
    var params = {
      'confirmed': true,
      'guid': guid
    };
    $fw.server.post(url, params, function(data) {
      if ($.isFunction(success)) {
        success(data);
      }
    });
  },

  search: function(query, success, fail) {
    // setup the url and request data
    var url = Constants.SEARCH_APPS_URL;
    var params = {
      search: query,
      grid: true
    };
    // Make request and determine correct callback
    $fw.server.post(url, params, function(data) {
      if ($.isArray(data.list)) {
        if ($.isFunction(success)) {
          success(data.list);
        }
      } else {
        if ($.isFunction(fail)) {
          fail(data);
        }
      }
    });
  },

  uploadIcon: function(jq_comp, params, success, fail, timeout) {
    var url = Constants.UPLOAD_ICON_URL;
    this.startUpload(jq_comp, url, params, function(res) {
      if ("ok" === res.result) {
        if ($.isFunction(success)) {
          success(res);
        }
      } else if (res.error) {
        if ($.isFunction(fail)) {
          fail(res);
        }
      }
    }, false, function(xhr, err) {
      var res = {};
      res.error = $fw.client.lang.getLangString('file_upload_error');
      fail(res);
    }, timeout);
  },

  updateFrameworks: function(guid, frameworks, success, fail) {
    var url = Constants.UPDATE_APP_FRAMEWORKS_URL;
    var params = {
      guid: guid,
      frameworks: frameworks
    };
    $fw.server.post(url, params, function(res) {
      if ($.isFunction(success)) {
        success(res);
      }
    }, function(err) {
      if ($.isFunction(fail)) {
        fail(err);
      }
    });
  },

  hosts: function(guid, success, fail) {
    var url = Constants.APP_HOSTS_URL;
    var params = {
      guid: guid
    };
    this.serverPost(url, params, success, fail, true);
  },

  migrate: function(params, success, failure) {
    var url = "/box/api/projects/" + params.projectguid + "/migrate";
    $fw.server.put(url, params, function(res) {
      if ($.isFunction(success)) {
        success(res);
      }
    }, function(err) {
      if ($.isFunction(failure)) {
        failure(err);
      }
    });
  }
});