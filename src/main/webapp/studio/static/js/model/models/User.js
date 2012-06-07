model.User = model.Model.extend({
  
  init: function () {
    
  },
  
  read: function (success, fail) {
    var url = Constants.READ_USER_DETAILS;
    var params = {};
    // no need to do any parsing of response for now, simply pass along callbacks
    $fw.server.post(url, params, success, fail);
  },
  
  changePassword: function (old_password, new_password, success, fail) {
    var url = Constants.CHANGE_USER_PASSWORD;
    var params = {
      current: old_password,
      'new': new_password,
      confirm: new_password
    };
    $fw.server.post(url, params, function (result) {
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
  },

  list: function (success, fail) {
    var url = Constants.ADMIN_USER_LIST_URL;
    var params = {};

    // See if we should be calling reseller or customer user list endpoint
    // based on our role
    var userRoles = $fw.getUserProps().roles;
    if (userRoles.indexOf($fw.ROLE_RESELLERADMIN) > -1) {
      url = url.replace('<users-type>', 'reseller');
      params.customer = $fw.getClientProp('reseller');
    } else if (userRoles.indexOf($fw.ROLE_CUSTOMERADMIN) > -1) {
      url = url.replace('<users-type>', 'customer');
      params.customer = $fw.getClientProp('customer');
    } else {
      return fail('operation_not_permitted');
    }

    // make server call and handle resposne
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
    }, fail, true);
  }
  
});