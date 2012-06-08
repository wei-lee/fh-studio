model.Model = Class.extend({
  init: function() {

  },

  serverPost: function(url, params, success, fail, no_payload, post_process) {
    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        if ($.isFunction(success)) {
          if ($.isFunction(post_process)) {
            res = (post_process(res));
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