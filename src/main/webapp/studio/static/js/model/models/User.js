model.User = model.Model.extend({

  // Model config
  config: {},

  // Field config
  field_config: [{
    field_name: "username",
    editable: false,
    showable: true,
    column_title: "User ID"
  }, {
    field_name: "email",
    editable: false,
    showable: true,
    column_title: "Email"
  }, {
    field_name: "name",
    editable: true,
    showable: true,
    column_title: "Name"
  }, {
    field_name: "enabled",
    editable: true,
    showable: true,
    column_title: "Enabled"
  }, {
    field_name: "lastLogin",
    editable: false,
    showable: true,
    column_title: "Last Login"
  }, {
    field_name: "sysCreated",
    editable: false,
    showable: true,
    column_title: "Created"
  }],

  init: function() {

  },

  create: function(id, email, name, roles, groups, password, activated, invite,  success, fail) {
    var user_type = this.resolveUserType();
    var url = Constants.ADMIN_USER_CREATE_URL.replace('<users-type>', user_type);
    var params = {
      "username": id,
      "activated": activated,
      "invite": invite
    };

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

    if (groups != null) {
      params.groups = groups;
    }

    params[user_type] = $fw.getClientProp(user_type);
    return this.serverPost(url, params, success, fail, true);
  },

  update: function(fields, success, fail) {
    var user_type = this.resolveUserType();
    var url = Constants.ADMIN_USER_UPDATE_URL;

    return this.serverPost(url, fields, success, fail, true);
  },

  remove: function(email, success, fail) {
    var user_type = this.resolveUserType();
    var url = Constants.ADMIN_USER_DELETE_URL.replace('<users-type>', user_type);
    var params = {
      "email": email
    };
    params[user_type] = $fw.getClientProp(user_type);

    return this.serverPost(url, params, success, fail, true);
  },

  resendInvite: function(email, success, fail) {
    var url = Constants.ADMIN_USER_RESEND_INVITE_URL.replace('<domain>', $fw_manager.getClientProp('domain'));
    var params = {
      "email": email,
      "force": true
    };

    return this.serverPost(url, params, success, fail, true);
  },

  resolveUserType: function() {
    var userRoles = $fw.getUserProps().roles;
    if (userRoles.indexOf($fw.ROLE_RESELLERADMIN) > -1) {
      return 'reseller';
    } else if (userRoles.indexOf($fw.ROLE_CUSTOMERADMIN) > -1) {
      return 'customer';
    } else {
      return fail('operation_not_permitted');
    }
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