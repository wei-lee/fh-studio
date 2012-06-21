model.Model = Class.extend({
  init: function() {},

  getColumnMap: function() {
    var column_map = {};

    $.each(this.field_config, function(i, item) {
      column_map[item.field_name] = item.column_title;
    });

    return column_map;
  },

  serverPost: function(url, params, success, fail, no_payload, post_process, model) {
    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        if ($.isFunction(success)) {
          if ($.isFunction(post_process)) {
            res = (post_process(res, model));
          }
          success(res);
        }
      } else {
        if ($.isFunction(fail)) {
          fail(res.message);
        }
      }
    }, fail, no_payload);
  }
});