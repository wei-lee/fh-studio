model.App = model.Model.extend({

  // Field config
  field_config: [{
    field_name: "icon",
    editable: false,
    showable: true,
    column_title: ""
  }, {
    field_name: "title",
    editable: false,
    showable: true,
    column_title: "Name"
  }, {
    field_name: "description",
    editable: false,
    showable: true,
    column_title: "Description"
  }, {
    field_name: "email",
    editable: false,
    showable: false,
    column_title: "Email"
  }, {
    field_name: "version",
    editable: false,
    showable: true,
    column_title: "Version"
  }, {
    field_name: "modified",
    editable: false,
    showable: true,
    column_title: "Last Modified"
  }, {
    field_name: "id",
    editable: false,
    showable: false,
    column_title: "App ID"
  }],

  init: function() {
    this._super();
  },

  list: function(success, fail, post_process) {
    var url = '',
      params = {};

    url = Constants.LIST_APPS_URL;

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
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
    $fw.app.startUpload(jq_comp, url, params, function(res) {
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
  }

});