model.User = model.Model.extend({
  
  init: function () {
    
  },
  
  read: function (success, fail) {
    var url = Constants.READ_USER_DETAILS;
    var params = {};
    // no need to do any parsing of response for now, simply pass along callbacks
    $fw_manager.server.post(url, params, success, fail);
  },
  
  changePassword: function (old_password, new_password, success, fail) {
    var url = Constants.CHANGE_USER_PASSWORD;
    var params = {
      current: old_password,
      'new': new_password,
      confirm: new_password
    };
    $fw_manager.server.post(url, params, function (result) {
      if(result.status === "ok"){
        if ($.isFunction(success)) {
          success(result);
        }
      }
      else {
        if ($.isFunction(fail)) {
          fail(result.message);
        }
      }
    }, fail);
  }
  
});