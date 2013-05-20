model.User = model.Model.extend({

  // Model config
  config: {},

  // Field config
  field_config: [{
    field_name: "username",
    column_title: "User ID"
  }, {
    field_name: "email",
    column_title: "Email"
  }, {
    field_name: "name",
    column_title: "Name"
  }, {
    field_name: "enabled",
    column_title: "Enabled"
  }, {
    field_name: "lastLogin",
    column_title: "Last Login"
  }, {
    field_name: "sysCreated",
    column_title: "Created"
  }],

  init: function() {

  },

  create: function(id, email, name, roles, policies, groups, storeitems, password, activated, invite, customerRoles, resellerRoles,  success, fail) {
    var url = Constants.ADMIN_USER_CREATE_URL;
    var params = {
      "username": id,
      "activated": activated,
      "invite": invite
    };

    // TODO: should all individual params be passed in here ??

    if (password != null) {
      params.password = password;
    }

    if (email != null) {
      params.email = email;
    }

    if (name != null) {
      params.name = name;
    }

    if (roles != null) {
      params.roles = roles;
    }

    if (policies != null) {
      params.authpolicies = policies;
    }

    if (groups != null) {
      params.groups = groups;
    }

    if (storeitems != null) {
      params.storeitems = storeitems;
    }

    if (customerRoles != null){
      params.customerRoles = customerRoles;
    }

    if (resellerRoles != null){
      params.resellerRoles = resellerRoles;
    }

    return this.serverPost(url, params, success, fail, true);
  },

  update: function(fields, success, fail) {
    var url = Constants.ADMIN_USER_UPDATE_URL;

    return this.serverPost(url, fields, success, fail, true);
  },

  remove: function(id, success, fail) {
    var url = Constants.ADMIN_USER_DELETE_URL;
    var params = {
      "username": id
    };

    return this.serverPost(url, params, success, fail, true);
  },

  resendInvite: function(email, success, fail) {
    var url = Constants.ADMIN_USER_RESEND_INVITE_URL.replace('<domain>', $fw.getClientProp('domain'));
    var params = {
      "email": email,
      "force": true
    };

    return this.serverPost(url, params, success, fail, true);
  },

  // purposely called imports due to keyword 'import'
  imports: function (invite, roles, authpolicies, groups, fileField, customerRoles, resellerRoles, success, fail, progress) {
    var url = Constants.ADMIN_USER_IMPORT_URL;
    var formData = [];

    if (invite != null) {
      formData.push({
        "name": "invite",
        "value": invite
      });
    }
    if (roles != null) {
      formData.push({
        "name": "roles",
        "value": roles
      });
    }
    if (authpolicies != null) {
      formData.push({
        "name": "authpolicies",
        "value": authpolicies
      });
    }

    if (customerRoles != null){
      formData.push({
        "name": "customerRoles",
        "value": customerRoles
      })
    }

    if (resellerRoles != null){
      formData.push({
        "name": "resellerRoles",
        "value": resellerRoles
      })
    }

    fileField.fileupload('option', {
      url: Constants.ADMIN_USER_IMPORT_URL,
      dataType: 'json',
      replaceFileInput: false,
      formData: formData,
      done: function(e, data) {
        var res = data.result;
        // TODO: figure out correct data or error to send back
        if (res != null && res.status != null && 'ok' === res.status) {
          success(data);
        } else {
          fail(data);
        }
      },
      progressall: function(e, data) {
        console.log(data);
        progress(data);
      }
    });

    // submit fileupload, with params in the formData too
    fileField.closest('form').data('import_users_file_data').submit();

    // TODO: cachekey handling
  },

  read: function(id, success, fail) {
    // are we reading a specific user, or..
    if ('function' !== typeof id) {
      var url = Constants.ADMIN_USER_READ_URL;
      var params = {
        "username": id
      };

      return this.serverPost(url, params, success, function (status, statusText) {
        if ('function' === typeof fail) {
          return fail('' + status + ':' + statusText);
        }
      }, true);
    } else {
      // or.. reading the currently logged in user
      // success is first arg i.e. id
      // fail is second arg i.e. success
      return this.userRead(id, success);
    }
  },

  userRead: function(success, fail) {
    var url = Constants.READ_USER_DETAILS;
    var params = {};
    // no need to do any parsing of response for now, simply pass along callbacks
    return $fw.server.post(url, params, success, fail);
  },

  changePassword: function(old_password, new_password, success, fail) {
    var url = Constants.CHANGE_USER_PASSWORD;
    var params = {
      current: old_password,
      'new': new_password,
      confirm: new_password
    };

    this.serverPost(url, params, success, fail);
  },

  list: function(success, fail, post_process) {
    var url = Constants.ADMIN_USER_LIST_URL;
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  }

});