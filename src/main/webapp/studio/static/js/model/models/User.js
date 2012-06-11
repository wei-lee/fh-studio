model.User = model.Model.extend({

  config: [{
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
    field_name: "activated",
    editable: true,
    showable: true,
    column_title: "Activated"
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

  update: function(fields, success, fail) {
    var user_type = this.resolveUserType();
    var url = Constants.ADMIN_USER_UPDATE_URL.replace('<users-type>', user_type);
    var params = {
      "fields": fields
    };
    params[user_type] = $fw.getClientProp(user_type);

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

  read: function(email, success, fail) {
    // See if we should be calling reseller or customer user read endpoint
    // based on our role, but only if we're specifying an email address
    // to read the user info for
    if ('function' !== typeof email) {
      var userRoles = $fw.getUserProps().roles;
      if (userRoles.indexOf($fw.ROLE_RESELLERADMIN) > -1) {
        return this.resellerUserRead(email, success, fail);
      } else if (userRoles.indexOf($fw.ROLE_CUSTOMERADMIN) > -1) {
        return this.customerUserRead(email, success, fail);
      } else {
        return fail('operation_not_permitted');
      }
    } else {
      // success is first arg i.e. email
      // fail is second arg i.e. success
      return this.userRead(email, success);
    }
  },

  userRead: function(success, fail) {
    var url = Constants.READ_USER_DETAILS;
    var params = {};
    // no need to do any parsing of response for now, simply pass along callbacks
    return $fw.server.post(url, params, success, fail);
  },

  customerUserRead: function(email, success, fail) {
    var url = Constants.ADMIN_USER_READ_URL.replace('<users-type>', 'customer');
    var params = {
      "customer": $fw.getClientProp('customer'),
      "email": email
    };

    return this.serverPost(url, params, success, fail, true);
  },

  resellerUserRead: function(email, success, fail) {
    var url = Constants.ADMIN_USER_READ_URL.replace('<users-type>', 'reseller');
    var params = {
      "reseller": $fw.getClientProp('reseller'),
      "email": email
    };

    return this.serverPost(url, params, success, fail, true);
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
    // See if we should be calling reseller or customer user list endpoint
    // based on our role
    var userRoles = $fw.getUserProps().roles;
    if (userRoles.indexOf($fw.ROLE_RESELLERADMIN) > -1) {
      return this.resellerList(success, fail, post_process);
    } else if (userRoles.indexOf($fw.ROLE_CUSTOMERADMIN) > -1) {
      return this.customerList(success, fail, post_process);
    } else {
      return fail('operation_not_permitted');
    }
  },

  customerList: function(success, fail, post_process) {
    var url = Constants.ADMIN_USER_LIST_URL.replace('<users-type>', 'customer');
    var params = {
      "customer": $fw.getClientProp('customer')
    };

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  resellerList: function(success, fail, post_process) {
    var url = Constants.ADMIN_USER_LIST_URL.replace('<users-type>', 'reseller');
    var params = {
      "reseller": $fw.getClientProp('reseller')
    };

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  postProcessList: function(res) {
    var filtered_fields = {
      "email": "E-mail",
      "name": "Name",
      "activated": "Activated",
      "enabled": "Enabled",
      "lastLogin": "Last Login",
      "sysCreated": "Created"
    };

    var rows = res.list;
    var data = {
      aaData: [],
      aoColumns: []
    };

    // Buid Data
    $.each(rows, function(i, item) {
      var row = item.fields;
      data.aaData.push([]);

      $.each(filtered_fields, function(k, v) {
        var value = row[k];
        data.aaData[i].push(value);
      });
    });

    // Build Columns
    $.each(filtered_fields, function(k, v) {
      data.aoColumns.push({
        sTitle: v
      });
    });

    return data;
  }

});