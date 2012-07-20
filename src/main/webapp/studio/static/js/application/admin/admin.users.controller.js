var Admin = Admin || {};

Admin.Users = Admin.Users || {};

Admin.Users.Controller = Controller.extend({
  models: {
    user: new model.User(),
    role: new model.Role()
  },

  views: {
    users: "#useradmin_user_list",
    user_create: "#useradmin_user_create",
    user_update: "#useradmin_user_update",
    user_import: "#useradmin_user_import"
  },

  container: null, // keeps track of currently active/visible container

  alert_timeout: 10000,

  user_table: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.field_config = params.field_config || null;
  },

  show: function (e) {
    this.showUsersList();
  },

  pageChange: function() {
    this.bindUserControls();
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  // type: error|success|info
  showAlert: function (type, message) {
    var self = this;
    var alerts_area = $(this.container).find('#alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function () {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },

  showUsersList: function() {
    var self = this;
    this.hide();
    $(this.views.users).show();
    this.container = this.views.users;

    this.models.user.list(function(res) {
      var data = self.addControls(res);
      self.renderUserTable(data);
      self.bindUserControls();
    }, function(err) {
      Log.append('Error showing users');
    }, true);
  },

  bindUserControls: function() {
    var self = this;
    $('tr td .edit_user', this.user_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.userDataForRow($(this).parent().parent().get(0));
      self.showUserUpdate(this, row, data);
      return false;
    });
    $('tr td .delete_user', this.user_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.userDataForRow($(this).parent().parent().get(0));
      self.deleteUser(this, row, data);
      return false;
    });
  },

  resendInvite: function() {
    var email = $(this.views.user_update).find('.user_email').val();

    this.models.user.resendInvite(email, function(res) {
      Log.append('User invite re-sent OK.');
      $fw.client.dialog.info.flash('Successfully re-sent invite.');
    }, function(e) {
      $fw.client.dialog.error("Error sending invite");
    });
  },

  showUserUpdate: function(button, row, data) {
    var self = this;

    this.hide();

    // Reset user update view
    var parent = $(this.views.user_update);
    parent.find('.user_name').val('');
    parent.find('.user_email').val('');
    parent.find('.user_resend_invite').hide();
    this.container = this.views.user_update;

    parent.show();

    parent.find('.update_user_btn').unbind().click(function() {
      self.updateUser();
      return false;
    });

    parent.find('.user_resend_invite').unbind().click(function() {
      self.resendInvite();
      return false;
    });

    var email = data[1];
    var name = data[2];
    var enabled = data[3];

    // Populate form
    parent.find('.user_name').val(name);
    parent.find('.user_email').val(email);
    parent.find('.user_resend_invite').show();

    if (enabled) {
      parent.find('.user_enabled').attr('checked', 'checked');
    } else {
      parent.find('.user_enabled').removeAttr('checked');
    }

    // Load available roles
    this.models.role.list_assignable(function(res) {
      Log.append('Role list OK.');
      var roles = res.list;
      self.updateUserAssignableRoles(roles);

    }, function(e) {
      $fw.client.dialog.error("Error loading roles.");
    });

    // Load available roles
    this.models.user.read(email, function(res) {
      Log.append('User role load OK.');
      var roles = res.fields.roles;
      self.updateCurrentUserRoles(roles);
    }, function(e) {
      $fw.client.dialog.error("Error loading user data");
    });
  },

  updateUser: function() {
    var self = this;
    var parent = $(this.views.user_update);

    var name = parent.find('.user_name').val();
    var email = parent.find('.user_email').val();
    var password = parent.find('.user_password').val();
    var enabled = parent.find('.user_enabled').is(':checked');
    var roles = parent.find('.user_roles').val();

    if (roles != null) {
      roles = roles.join(", ");
    }

    var fields = {
      email: email,
      name: name,
      enabled: enabled
    };

    if (password != null && password !== '') {
      fields.password = password;
    }
    if (roles != null && roles !== '') {
      fields.roles = roles;
    }

    this.models.user.update(fields, function(res) {
      Log.append('updateUser: OK');
      self.showUsersList();
    }, function(err) {
      Log.append(err);
    });
  },

  emailFromRow: function(row) {
    return $('td:first', row).text() || null;
  },

  fieldsFromRow: function(row, data_model) {
    var self = this;
    var fields = {};
    $('td', row).each(function(i, td) {
      // Check editable
      if (data_model.field_config[i] && data_model.field_config[i].editable) {
        // Check Checkbox
        var checkbox = $(td).find('input[type=checkbox]');

        if (checkbox.length > 0) {
          var val = $(checkbox).is(":checked");
          fields[data_model.field_config[i].field_name] = val;
        } else {
          fields[data_model.field_config[i].field_name] = $('input', td).val();
        }
      }
    });

    return fields;
  },

  deleteUser: function(button, row, data) {
    var self = this;

    var modal = $('#useradmin_user_delete_modal').clone();
    modal.appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.btn-primary').on('click', function () {
      // confirmed delete, go ahead
      modal.modal('hide');
      self.showAlert('info', '<strong>Deleting User</strong> This may take some time.');
      // delete user
      var email = data[1];
      self.models.user.remove(email, function(res) {
        self.showAlert('success', '<strong>User Successfully Deleted</strong>');
        // remove user from table
        self.user_table.fnDeleteRow(row[0]);
      }, function(e) {
        self.showAlert('error', '<strong>Problem Deleting User</strong> ' + e);
      });
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function () {
        modal.remove();
      }, 2000);
    });
  },

  renderUserTable: function(data) {
    var self = this;

    this.user_table = $('#useradmin_users_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });

    // Inject Import and Create button
    var import_button = $('<button>').addClass('btn pull-right import_users').text('Import Users').click(function() {
      self.showImportUsers();
      return false;
    });
    var create_button = $('<button>').addClass('btn btn-primary pull-right').text('Create').click(function() {
      self.showCreateUser();
      return false;
    });
    $(this.views.users + ' .span12:first').append(create_button).append(import_button);
  },

  showCreateUser: function() {
    var self = this;
    this.hide();
    $(this.views.user_create).show();
    this.container = this.views.user_create;

    $(this.views.user_create + ' .create_user_btn').unbind().click(function() {
      self.createUser();
      return false;
    });

    // Load roles & Groups
    this.models.role.list_assignable(function(res) {
      Log.append('Role list OK.');
      var roles = res.list;
      self.updateUserAssignableRoles(roles);

    }, function(e) {
      $fw.client.dialog.error("Error loading roles.");
    });
  },

  showImportUsers: function () {
    var self = this;
    this.hide();

    $(this.views.user_import).show();
    this.container = this.views.user_import;

    $(this.views.user_import + '.import_user_btn').unbind().click(function() {
      self.importUsers();
      return false;
    });
  },

  updateUserAssignableRoles: function(roles) {
    var role_list = $('.user_roles:visible').empty();
    $.each(roles, function(i, role) {
      var option = $('<option>').text(role);
      role_list.append(option);
    });
    role_list.removeAttr("disabled");
  },

  updateCurrentUserRoles: function(roles) {
    var role_list = $('.user_current_roles:visible').empty();
    $.each(roles, function(i, role) {
      var option = $('<option>').text(role);
      role_list.append(option);
    });
    role_list.removeAttr("disabled");
  },

  createUser: function() {
    var self = this;

    var form = $(this.views.user_create + ' form');

    var id = form.find('#create_user_id').val();
    var password = form.find('#create_user_password').val();
    if (password === '') {
      password = null;
    }
    var email = form.find('#create_user_email').val();
    if (email === '') {
      email = null;
    }
    var name = form.find('#create_user_name').val();
    if (name === '') {
      name = null;
    }
    var invite = form.find('#create_user_invite').is(':checked');

    var roles = $(this.views.user_create + ' .user_roles').val();
    if (roles) {
      roles = roles.join(', ');
    }

    var groups = form.find('#create_user_groups').val();
    if (groups) {
      groups = groups.join(', ');
    }

    var activated = true;
    this.models.user.create(id, email, name, roles, groups, password, activated, invite, function(res) {
      console.log(res);
      self.showUsersList();
    }, function(e) {
      if (typeof e == 'undefined') {
        $fw.client.dialog.error("Error creating user");
      } else {
        $fw.client.dialog.error("Error creating user: " + e);
      }
    });
  },

  importUsers: function () {
    // TODO: validate fields and call import endpoint
    alert('IMPLEMENT IMPORT USERS!!!');
  },

  rowRender: function(row, data) {
    this.renderCheckboxes(row, data);
  },

  renderCheckboxes: function(row, data) {
    $('td', row).each(function(i, item) {
      // TODO: Move to clonable hidden_template
      if (data[i] === true) {
        $(item).html('<input type="checkbox" checked disabled/>');
      }

      if (data[i] === false) {
        $(item).html('<input type="checkbox" disabled/>');
      }
    });
  },

  userDataForRow: function(el) {
    return this.user_table.fnGetData(el);
  },

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_user">Edit</button>&nbsp;');
      controls.push('<button class="btn btn-danger delete_user">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  }
});