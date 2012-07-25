var Admin = Admin || {};

Admin.Users = Admin.Users || {};

Admin.Users.Controller = Controller.extend({
  models: {
    user: new model.User(),
    role: new model.Role()/*,
    group: new model.Group(),
    storeitem: new model.StoreItem()*/
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
    var self = this;
    var email = $(this.views.user_update).find('#update_user_email').val();

    self.showAlert('info', '<strong>Sending Invite</strong> (' + email + ')');
    self.models.user.resendInvite(email, function(res) {
      Log.append('User invite re-sent OK.');
      self.showAlert('success', '<strong>Successfully sent Invite</strong> (' + email + ')');
    }, function(e) {
      self.showAlert('error', '<strong>Error sending Invite</strong> (' + email + ') ' + e);
    });
  },

  showUserUpdate: function(button, row, data) {
    var self = this;
    this.hide();

    var parent = $(this.views.user_update);
    this.container = this.views.user_update;

    var populateForm = function (results) {
      Log.append('populating user update form');
      var user = results[0];
      $('#update_user_id', parent).val(user.username);
      $('#update_user_name', parent).val(user.name);
      $('#update_user_email', parent).val(user.email);
      if (user.email != null && user.email !== '') {
        $('.invite_user_btn', parent).removeAttr('disabled');
      }

      // setup enabled/blacklisted checkboxes and buttons
      self.setUserEnabled(user.enabled);
      self.setUserBlacklisted(user.blacklisted);

      // no need to show sub role
      var rolesTo = user.roles;
      if (rolesTo.indexOf('sub') > -1) {
        rolesTo.splice(rolesTo.indexOf('sub'), 1);
      }
      // take out 'name' field from storeitems
      // var itemsFrom = [];
      // for (var ri = 0, rl = results[2].length; ri < rl; ri += 1) {
      //   itemsFrom.push(results[2][ri].name);
      // }
      self.updateSwapSelect('#update_user_role_swap', results[1], rolesTo);
      //self.updateSwapSelect('#update_user_group_swap', results[2], user.groups);
      //self.updateSwapSelect('#update_user_storeitem_swap', itemsFrom, user.storeitems);
      self.bindSwapSelect(parent);

      $('input,select,button', parent).not('#update_user_id,#update_user_enabled,#update_user_blacklisted,.invite_user_btn').removeAttr('disabled');
    };

    self.resetForm(parent);
    parent.show();

    $('.update_user_btn', parent).unbind().click(function() {
      self.updateUser();
      return false;
    });

    $('.invite_user_btn', parent).unbind().click(function() {
      self.resendInvite();
      return false;
    });

    // Setup user details, roles and groups
    var id = data[0];
    async.parallel([function (cb) {
      // user details
      self.models.user.read(id, function(res) {
        Log.append('User read OK.');
        return cb(null, res.fields);
      }, function(e) {
        return cb(e);
      });
    }, function (cb) {
      // roles
      self.models.role.list_assignable(function(res) {
        Log.append('Role list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }/*, function (cb) {
      // storeitems
      self.models.storeitem.list(function (res) {
        Log.append('Storeitem list OK');
        return cb(null, res.list);
      }, function (e) {
        return cb(e);
      });
    }*//* function (cb) {
      // groups
      self.models.group.list(function(res) {
        Log.append('Group list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }*/], function (err, results) {
      if (err != null) {
        return self.showAlert('error', '<strong>Error loading user data</strong> ' + err);
      }
      return populateForm(results);
    });
  },

  updateUser: function() {
    var self = this;

    var form = $(this.views.user_update + ' form');
    var fields = {};

    // required fields first
    // text inputs
    fields.username = form.find('#update_user_id').val();
    // checkbox fields
    fields.enabled = form.find('#update_user_enabled').is(':checked');
    fields.blacklisted = form.find('#update_user_blacklisted').is(':checked');

    // optional fields
    // text inputs
    var password = form.find('#update_user_password').val();
    if (password !== '') {
      fields.password = password;
    }
    var email = form.find('#update_user_email').val();
    if (email !== '') {
      fields.email = email;
    }
    var name = form.find('#update_user_name').val();
    if (name !== '') {
      fields.name = name;
    }
    // select fields
    var rolesArr = [];
    $('#update_user_role_swap .swap-to option', this.views.user_update).each(function (i, item) {
      rolesArr.push($(item).text());
    });
    fields.roles = (rolesArr.length > 0) ? rolesArr.join(', ') : '';
    // var storeitemsArr = [];
    // $('#update_user_storeitem_swap .swap-to option', this.views.user_update).each(function (i, item) {
    //   storeitemsArr.push($(item).text());
    // });
    // if (storeitemsArr.length > 0) {
    //   fields.storeitems = storeitemsArr.join(', ');
    // }
    // var groupsArr = [];
    // $('#update_user_group_swap .swap-to option', this.views.user_update).each(function (i, item) {
    //   groupsArr.push($(item).text());
    // });
    // if (groupsArr.length > 0) {
    //   fields.groups = groupsArr.join(', ');
    // }

    this.models.user.update(fields, function(res) {
      Log.append('updateUser: OK');
      self.showUsersList();
      self.showAlert('success', '<strong>User successfully updated</strong> (' + res.fields.username + ')');
    }, function(err) {
      Log.append(err);
      self.showAlert('error', '<strong>Error updating User</strong> ' + err);
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

    // initialise all swap selects
    self.bindSwapSelect(this.container);

    // Load roles & storeitems into swap select
    this.models.role.list_assignable(function(res) {
      Log.append('Role list OK.');
      var roles = res.list;
      var container = '#create_user_role_swap';
      self.updateSwapSelect(container, roles);
    }, function(e) {
      self.showAlert('error', '<strong>Error loading Roles</strong> ' + e);
    });

    // this.models.storeitem.list(function(res) {
    //   Log.append('Storeitem list OK.');
    //   var storeitems = res.list;
    //   var container = '#create_user_storeitem_swap';
    //   // take out 'name' field from storeitems
    //   var itemsFrom = [];
    //   for (var si = 0, sl = storeitems.length; si < sl; si += 1) {
    //     itemsFrom.push(storeitems[si].name);
    //   }
    //   self.updateSwapSelect(container, itemsFrom);
    // }, function(e) {
    //   self.showAlert('error', '<strong>Error loading Store Items</strong> ' + e);
    // });

    // this.models.group.list(function(res) {
    //   Log.append('Group list OK.');
    //   var groups = res.list;
    //   var container = '#create_user_group_swap';
    //   self.updateSwapSelect(container, groups);
    // }, function(e) {
    //   self.showAlert('error', '<strong>Error loading Groups</strong> ' + e);
    // });
  },

  showImportUsers: function () {
    var self = this;
    self.hide();

    self.container = self.views.user_import;
    var parent = $(self.container);

    self.resetForm(parent);
    parent.show();

    // initialise all swap selects
    self.bindSwapSelect(self.container);

    // initial file upload
    var fileInput = $('#import_users_file').fileupload('destroy');
    fileInput.fileupload({
      add: function(e, data){
        setTimeout(function(){
          $('form', parent).data('import_users_file_data', data);
          return false;
        }, 100);
      }
    });

    // Load roles & storeitems into swap select
    self.models.role.list_assignable(function(res) {
      Log.append('Role list OK.');
      var roles = res.list;
      var container = '#import_users_role_swap';
      self.updateSwapSelect(container, roles);
      $('input,select,button', parent).removeAttr('disabled');

    }, function(e) {
      self.showAlert('error', '<strong>Error loading Roles</strong> ' + e);
    });

    $('.import_user_btn', parent).unbind().click(function() {
      self.importUsers();
      return false;
    });
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

    var rolesArr = [];
    $('#create_user_role_swap .swap-to option', this.views.user_create).each(function (i, item) {
      rolesArr.push($(item).text());
    });
    var roles = rolesArr.length > 0 ? rolesArr.join(', ') : null;

    // var storeitemsArr = [];
    // $('#create_user_storeitem_swap .swap-to option', this.views.user_create).each(function (i, item) {
    //   storeitemsArr.push($(item).text());
    // });
    // var storeitems = storeitemsArr.length > 0 ? storeitemsArr.join(', ') : null;
    var storeitems = null;

    // var groupsArr = [];
    // $('#create_user_group_swap .swap-to option', this.views.user_create).each(function (i, item) {
    //   groupsArr.push($(item).text());
    // });
    // var groups = groupsArr.length > 0 ? groupsArr.join(', ') : null;
    var groups = null;

    var activated = true;
    self.showAlert('info', '<strong>Creating User</strong> (' + id + ')');
    this.models.user.create(id, email, name, roles, groups, storeitems, password, activated, invite, function(res) {
      self.showUsersList();
      self.showAlert('success', '<strong>Successfully create User</strong> (' + id + ')');
    }, function(e) {
      self.showAlert('error', '<strong>Error creating User</strong> ' + e);
    });
  },

  importUsers: function () {
    var self = this;
    var form = $(this.views.user_import + ' form');

    var invite = form.find('#import_users_invite').is(':checked');
    var rolesArr = [];
    $('#import_users_role_swap .swap-to option', this.views.user_import).each(function (i, item) {
      rolesArr.push($(item).text());
    });
    var roles = rolesArr.length > 0 ? rolesArr.join(', ') : ''; // important to send '' here if no roles selected to ensure roles updated to remove all
    var groups = null;
    var fileField = form.find('#import_users_file');


    self.showAlert('info', '<strong>Importing Users</strong>');

    $('#generic_progress_modal').clone()
      .find('h3').text('Importing Users').end()
      .appendTo($("body")).one('shown', function () {

      }).modal();

    self.models.user.imports(invite, roles, groups, fileField, function(data) {
      var res = data.result;
        self.showProgressModal(res.cachekey, {
          title: 'Generating Your App',
          initLog: 'We\'re generating your app...',
          timeout: function(res) {
            Log.append('timeout error > ' + JSON.stringify(res));
            $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
            self.updateProgressModalBar(100);
            if (typeof fail != 'undefined') {
              fail();
            }
          },
          update: function(res) {
            for (var i = 0; i < res.log.length; i++) {
              Log.append(res.log[i]);
              if (typeof res.action.guid != 'undefined') {
                new_guid = res.action.guid;
                Log.append('GUID for new app > ' + new_guid);
              }
              self.appendProgressModalLog(res.log[i], modal);
              Log.append("Current progress> " + self.current_progress);
            }
            self.updateProgressModalBar(self.current_progress + 1);
          },
          complete: function(res) {
            Log.append('SCM refresh successful > ' + JSON.stringify(res));
            self.updateProgressModalBar(75);
          },
          error: function(res) {
            Log.append('clone error > ' + JSON.stringify(res));
            $fw.client.dialog.error('App generation failed.' + "<br /> Error Message:" + res.error);
            self.updateProgressModalBar(100);
            if (typeof fail != 'undefined') {
              fail();
            }
          },
          retriesLimit: function() {
            Log.append('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
            $fw.client.dialog.error('App generation failed.');
            self.updateProgressModalBar(100);
            if (typeof fail != 'undefined') {
              fail();
            }
          },
          end: function(guid, modal) {
            self.showUsersList();
            self.showAlert('success', '<strong>Successfully imported Users</strong>');
          }
        });
    }, function(e) {
      self.showAlert('error', '<strong>Error importing Users</strong> ' + e);
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
  },

  setUserEnabled: function (enabled) {
    var self = this;
    if (enabled) {
      $('#update_user_enabled').attr('checked', 'checked');
      $('.enable_user_button').text('Disable User').unbind().on('click', function () {
        self.disableUser();
      });
    } else {
      $('#update_user_enabled').removeAttr('checked');
      $('.enable_user_button').text('Enable User').unbind().on('click', function () {
        self.enableUser();
      });
    }
  },

  setUserBlacklisted: function (blacklisted) {
    var self = this;
    if (blacklisted) {
      $('#update_user_blacklisted').attr('checked', 'checked');
      $('.blacklist_user_button').text('Whitelist User').unbind().on('click', function () {
        self.whitelistUser();
      });
    } else {
      $('#update_user_blacklisted').removeAttr('checked');
      $('.blacklist_user_button').text('Blacklist User').unbind().on('click', function () {
        self.blacklistUser();
      });
    }
  },

  deleteUser: function(button, row, data) {
    var self = this;
    self.showBooleanModal('Are you sure you want to delete this User?', function () {
      var id = data[0];
      self.showAlert('info', '<strong>Deleting User</strong> (' + id + ') This may take some time.');
      // delete user
      self.models.user.remove(id, function(res) {
        self.showAlert('success', '<strong>User Successfully Deleted</strong> (' + id + ')');
        // remove user from table
        self.user_table.fnDeleteRow(row[0]);
      }, function(e) {
        self.showAlert('error', '<strong>Error Deleting User</strong> (' + id + ') ' + e);
      });
    });
  },

  enableUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to enable this User?', function () {
      self.changeBooleanField('enabled', true, 'Enabling', function () {
        self.setUserEnabled(true);
      });
    });
  },

  disableUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to disable this user? This user will no longer be able to authenticate.', function () {
      self.changeBooleanField('enabled', false, 'Disabling', function () {
        self.setUserEnabled(false);
      });
    });
  },

  blacklistUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to Blacklist this User? (In supported apps, data will be purged at next login.)', function () {
      self.changeBooleanField('blacklisted', true, 'Blacklisting', function () {
        self.setUserBlacklisted(true);
      });
    });
  },

  whitelistUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to Whitelist this User?', function () {
      self.changeBooleanField('blacklisted', false, 'Whitelisting', function () {
        self.setUserBlacklisted(false);
      });
    });
  },

  changeBooleanField: function (boolField, boolVal, actionDesc, success) {
    var self = this;
    var form = $(self.views.user_update + ' form');
    var fields = {
      "username": form.find('#update_user_id').val()
    };
    fields[boolField] = boolVal;

    self.showAlert('info', '<strong>' + actionDesc + ' User</strong> (' + fields.username + ')');
    self.models.user.update(fields, function(res) {
      Log.append(actionDesc + ' User OK');
      self.showAlert('success', '<strong>' + actionDesc + ' User successful</strong> (' + fields.username + ')');
      success();
    }, function(err) {
      Log.append(err);
      self.showAlert('error', '<strong>Error ' + actionDesc + ' User</strong> ' + err);
    });
  }
});