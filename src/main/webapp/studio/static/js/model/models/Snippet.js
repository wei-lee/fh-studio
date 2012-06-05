model.Snippet = model.Model.extend({
  init: function () {
    
  },
  
  create: function (fields, success) {
    Log.append('Snippet.create');
    var url = Constants.CREATE_SNIPPET_URL;
    var params = fields;
    params.domain = Constants.DOMAIN;
    $fw_manager.server.post(url, params, function (data) {
      if ($.isFunction(success)) {
        success(data);
      }
    });
  },
  
  read: function (guid, success, fail) {
    Log.append('Snippet.read');
    var url = Constants.VIEW_SNIPPET_URL;
    var data = {
      guid: guid
    };
    $fw_manager.server.post(url, data, function (data) {
      // TODO: this should be moved to ServerManager so all calls dont have to parse out payload
      var context = data.context;
      var payload = data.payload;
      if ('ok' === context.status) {
        if ($.isFunction(success)) {
          success(payload)
        }
      }
      else {
        if ($.isFunction(fail)) {
          fail(context.message)
        }
      }
    }, function (error) {
      var context = error.context;
      var payload = error.payload;
      if ($.isFunction(fail)) {
        fail(context.message)
      }
    });
  },
  
  update: function (guid, fields, success) {
    Log.append('Snippet.update');
    var url = Constants.UPDATE_SNIPPET_URL;
    var params = {
      guid: guid,
      fields: fields
    };
    // TODO: error callback should also happen if update failed, not just if status wasn't 200
    $fw_manager.server.post(url, params, function (data) {
      if ($.isFunction(success)) {
        success(data);
      }
    });
  },
  
  search: function (query, success) {
    Log.append('Snippet.search');
    var url = Constants.SEARCH_SNIPPETS_URL;
    var params = {
      query: query
    };
    // TODO: error callback should also happen if search failed, not just if status wasn't 200
    $fw_manager.server.post(url, params, function (data) {
      if ($.isFunction(success)) {
        success(data.list);
      }
    });
  },
  
  list: function (success) {
    Log.append('Snippet.list');
    var url = Constants.LIST_MY_SNIPPETS_URL;
    var params = {};
    $fw_manager.server.post(url, params, function (data) {
      if ($.isFunction(success)) {
        success(data.list);
      }
    });
  },
  
  listByTag: function (tag, success) {
    Log.append('Snippet.listByTag');
    var url = Constants.LIST_SNIPPETS_BY_TAG_URL;
    var params = {
      tag: tag
    };
    $fw_manager.server.post(url, params, function (data) {
      if ($.isFunction(success)) {
        success(data.list);
      }
    });
  },
  
  listTags: function (success) {
    Log.append('Snippet.listTags');
    var url = Constants.LIST_TAGS_URL;
    var params = {};
    $fw_manager.server.post(url, params, function (data) {
      if ($.isFunction(success)) {
        success(data.list);
      }
    });
  }
});