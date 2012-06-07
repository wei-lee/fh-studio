model.Model = Class.extend({
  init: function () {
    
  },

  serverPost: function (url, params, success, fail, no_payload) {
    $fw.server.post(url, params, function (res) {
      if(res.status === "ok"){
        if ($.isFunction(success)) {
          success(res);
        }
      }
      else {
        if ($.isFunction(fail)) {
          fail(res.message);
        }
      }
    }, fail, no_payload);
  }
});