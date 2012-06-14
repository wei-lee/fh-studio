var UserAdmin = UserAdmin || {};

UserAdmin.Controller = Class.extend({

  models: {
    user: new model.User(),
    // group: new model.Group(),
    role: new model.Role()
  },

  // TODO: Refactor below to use these
  views: {
    users: "#useradmin_user_list",
    // groups: "#useradmin_group_list",
    // group_create: "#useradmin_group_create",
    user_create: "#useradmin_user_create",
    user_update: "#useradmin_user_update"
  },

  user_table: null,
  // group_table: null,
  init: function(params) {
    var self = this;
    params = params || {};
    this.field_config = params.field_config || null;
  },

  pageChange: function() {
    this.bindUserControls();
  },

  hideViews: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  showUsersList: function() {
    var self = this;
    this.hideViews();
    $(this.views.users).show();

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
    $('tr td .edit_user', this.user_table).click(function() {
      var row = $(this).parent().parent();
      var data = self.userDataForRow($(this).parent().parent().get(0));

      // if ($(this).hasClass('update_user')) {
      //   // Update action
      //   self.updateUser(this, row, data);
      //   $(this).removeClass('btn-success update_user').text('Edit');
      // } else {
      //   // Edit action
      //   self.editUser(this, row, data);
      //   $(this).addClass('btn-success update_user').text('Update');
      // }
      // 
      // 
      self.showUserUpdate(this, row, data);
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

    this.hideViews();

    // Reset user update view
    $(this.views.user_update).find('.user_name').val('');
    $(this.views.user_update).find('.user_email').val('');
    $(this.views.user_update).find('.user_resend_invite').hide();

    $(this.views.user_update).show();

    $('#useradmin_user_update .update_user_btn').unbind().click(function() {
      self.updateUser();
      return false;
    });

    $('#useradmin_user_update .user_resend_invite').unbind().click(function() {
      self.resendInvite();
      return false;
    });

    var email = data[0];
    var name = data[1];
    var activated = data[2];
    var enabled = data[3];

    // Populate form
    $(this.views.user_update).find('.user_name').val(name);
    $(this.views.user_update).find('.user_email').val(email);

    if (activated) {
      $(this.views.user_update).find('.user_activated').attr('checked', 'checked');
    } else {
      $(this.views.user_update).find('.user_activated').removeAttr('checked');
      $(this.views.user_update).find('.user_resend_invite').show();
    }

    if (enabled) {
      $(this.views.user_update).find('.user_enabled').attr('checked', 'checked');
    } else {
      $(this.views.user_update).find('.user_enabled').removeAttr('checked');
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
    var name = $('#useradmin_user_update .user_name').val();
    var email = $('#useradmin_user_update .user_email').val();
    var password = $('#useradmin_user_update .user_password').val();
    var enabled = $('#useradmin_user_update .user_enabled').is(':checked');
    var activated = $('#useradmin_user_update .user_activated').is(':checked');
    var roles = $('#useradmin_user_update .user_roles').val();

    if (roles != null) {
      roles = roles.join(", ");
    }

    var fields = {
      email: email,
      name: name,
      activated: activated,
      enabled: enabled
    };

    if (password != '') {
      fields.password = password;
    }
    if (roles != null && roles != '') {
      fields.roles = roles;
    }

    this.models.user.update(fields, function(res) {
      Log.append('updateUser: OK');
      self.showUsersList();
    }, function(err) {
      Log.append(err);
    });

    //this.toggleEditableRow(row, this.models.user);
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

  toggleEditableRow: function(row, data_model) {
    var self = this;

    if (row.hasClass('editing')) {
      row.removeClass('editing');
      $('td', row).each(function(i, td) {
        // Field should be editable?
        if (data_model.field_config[i] && data_model.field_config[i].editable) {
          // Checkbox row check
          var checkbox = $(td).find('input[type=checkbox]');

          if (checkbox.length > 0) {
            $(checkbox).attr('disabled', 'true');
          } else {
            var text = $('input', td).val();

            // Empty cell
            $(td).empty();
            $(td).text(text);
          }
        }
      });
    } else {
      row.addClass('editing');
      $('td', row).each(function(i, td) {
        // Field should be editable?
        if (data_model.field_config[i] && data_model.field_config[i].editable) {
          // Checkbox row check
          var checkbox = $(td).find('input[type=checkbox]');

          if (checkbox.length > 0) {
            $(checkbox).removeAttr('disabled');
          } else {
            var text = $(td).text();
            var width = $(td).width();

            // Empty cell
            $(td).empty();
            $(td).append('<input type="text"/>');
            $(td).find('input').css('width', (width - 50) + 'px').val(text);
          }
        }
      });
    }
  },

  deleteUser: function(button, row, data) {},

  // bindGroupControls: function() {
  //   var self = this;
  //   $('#useradmin_group_create .create_group_btn').unbind().click(function() {
  //     var group_name = $('.group_name').val();
  //     self.createGroup(group_name);
  //     return false;
  //   });
  // },
  // createGroup: function(group_name) {
  //   var self = this;
  //   this.models.group.create(group_name, function(res) {
  //     Log.append('createGroup: OK');
  //     $fw.client.dialog.info.flash('Group created, refreshing list.');
  //     self.showGroupsList();
  //   }, function(err) {
  //     Log.append(err);
  //     $fw.client.dialog.error("Error creating your group - group names must be unique.");
  //   });
  // },
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

    // Inject Create button
    var create_button = $('<button>').addClass('btn btn-primary right').text('Create').click(function() {
      self.showCreateUser();
      return false;
    });
    $('#useradmin_user_list .span12:first').append(create_button);
  },

  showCreateUser: function() {
    var self = this;
    this.hideViews();
    $('#useradmin_user_create').show();

    $('#useradmin_user_create .create_user_btn').unbind().click(function() {
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

    // this.models.group.list(function(res) {
    //   var groups = res.list;
    //   self.updateUserAssignableGroups(groups);
    // }, function(err) {
    //   $fw.client.dialog.error("Error loading groups.");
    // });
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

  // updateUserAssignableGroups: function(groups) {
  //   var group_list = $('#useradmin_user_create .user_group').empty();
  //   $.each(groups, function(i, group) {
  //     var option = $('<option>').text(group.fields.name).val(group.guid);
  //     group_list.append(option);
  //   });
  //   group_list.removeAttr("disabled");
  // },
  updateUserAssignableRoles: function(roles) {
    var role_list = $('.user_roles:visible').empty();
    $.each(roles, function(i, role) {
      var option = $('<option>').text(role);
      role_list.append(option);
    });
    role_list.removeAttr("disabled");
  },

  createUser: function() {
    var self = this;
    var name = $('#useradmin_user_create .user_name').val();
    var email = $('#useradmin_user_create .user_email').val();
    var password = $('#useradmin_user_create .user_password').val();
    if (password === '') {
      password = null;
    }
    var roles = $('#useradmin_user_update .user_roles').val();
    var activated;
    var invite = $('#useradmin_user_create .user_invite').is(':checked');

    if (roles) {
      roles = roles.join(', ');
    }

    // If we send an invite to the user, don't pre-activate
    if (invite) {
      activated = false;
    } else {
      activated = true;
    }

    this.models.user.create(email, name, roles, password, activated, invite, function(res) {
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

  // groupDataForRow: function(el) {
  //   return this.group_table.fnGetData(el);
  // },
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
      // controls.push('<button class="btn btn-danger delete_user">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  },

  // showGroupsList: function() {
  //   var self = this;
  //   this.hideViews();
  //   $(this.views.groups).show();
  //   this.models.group.list(function(res) {
  //     self.renderGroupTable(res);
  //     self.bindGroupControls();
  //   }, function(err) {
  //     console.error(err);
  //   }, true);
  // },
  // renderGroupTable: function(data) {
  //   var self = this;
  //   this.group_table = $('#useradmin_groups_table').dataTable({
  //     "bDestroy": true,
  //     "bAutoWidth": false,
  //     "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
  //     "sPaginationType": "bootstrap",
  //     "bLengthChange": false,
  //     "aaData": data.aaData,
  //     "aoColumns": data.aoColumns,
  //     "fnRowCallback": function(nRow, aData, iDisplayIndex) {
  //       self.rowRender(nRow, aData);
  //     }
  //   });
  //   // Inject Create button
  //   var create_button = $('<button>').addClass('btn btn-primary right').text('Create').click(function() {
  //     self.showCreateGroup();
  //     return false;
  //   });
  //   $('#useradmin_group_list .span12:first').append(create_button);
  // },
  // showCreateGroup: function() {
  //   this.hideViews();
  //   $('#useradmin_group_create').show();
  // }
});