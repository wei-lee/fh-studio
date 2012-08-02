var Admin = Admin || {};

Admin.Users = Admin.Users || {};

Admin.Users.Controller = Controller.extend({
  models: {
    user: new model.User(),
    role: new model.Role(),
    policy: new model.ArmAuthPolicy()/*,
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
  alert_timeout: 3000,
  user_table: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.field_config = params.field_config || null;
  },

  show: function (e) {
    // TODO: stateful restore i.e. $fw.state
    this.hideAlerts();
    this.showUsersList();
  },

  reset: function() {    
    $.each(this.views, function(k, v) {
      $('input[type=text],input[type=email],input[type=password], textarea', v).val('');
      $('input[type=checkbox]', v).removeAttr('checked');
    });
  },

  pageChange: function() {
    this.bindUserControls();
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
    this.reset();
  },

  // type: error|success|info
  showAlert: function (type, message) {
    var self = this;
    var alerts_area = $(this.container).find('.alerts');
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
      console.log('Error showing users');
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
      console.log('User invite re-sent OK.');
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
      console.log('populating user update form');
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

      var policiesFrom = [];
      var policyIdGuidMap = {};
      for (var pi = 0, pl = results[2].length; pi < pl; pi += 1) {
        policiesFrom.push([results[2][pi].policyId, results[2][pi].guid]);
        policyIdGuidMap[results[2][pi].guid] = results[2][pi].policyId;
      }
      var policiesTo = [];
      for (pi = 0, pl = user.authpolicies.length; pi < pl; pi += 1) {
        policiesTo.push([policyIdGuidMap[user.authpolicies[pi]] || ('Unknown Policy - ' + user.authpolicies[pi]), user.authpolicies[pi]]);
      }

      self.updateSwapSelect('#update_user_role_swap', results[1], rolesTo);
      self.updateSwapSelect('#update_user_policy_swap', policiesFrom, policiesTo);
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
        console.log('User read OK.');
        return cb(null, res.fields);
      }, function(e) {
        return cb(e);
      });
    }, function (cb) {
      // roles
      self.models.role.list_assignable(function(res) {
        console.log('Role list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }, function (cb) {
      // roles
      self.models.policy.list(function(res) {
        console.log('Policy list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }], function (err, results) {
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
      rolesArr.push($(item).val());
    });
    fields.roles = (rolesArr.length > 0) ? rolesArr.join(', ') : '';

    // select fields
    var policiesArr = [];
    $('#update_user_policy_swap .swap-to option', this.views.user_update).each(function (i, item) {
      policiesArr.push($(item).val());
    });
    fields.authpolicies = (policiesArr.length > 0) ? policiesArr.join(', ') : '';

    this.models.user.update(fields, function(res) {
      console.log('updateUser: OK');
      self.showUsersList();
      self.showAlert('success', '<strong>User successfully updated</strong> (' + res.fields.username + ')');
    }, function(err) {
      console.log(err);
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

    // Load roles & policies into swap select
    this.models.role.list_assignable(function(res) {
      console.log('Role list OK.');
      var roles = res.list;
      var container = '#create_user_role_swap';
      self.updateSwapSelect(container, roles);
    }, function(e) {
      self.showAlert('error', '<strong>Error loading Roles</strong> ' + e);
    });

    this.models.policy.list(function(res) {
      console.log('Policy list OK.');
      var policies = res.list;
      var container = '#create_user_policy_swap';
      // take out 'name' and 'guid' fields from storeitems
      var itemsFrom = [];
      for (var pi = 0, pl = policies.length; pi < pl; pi += 1) {
        itemsFrom.push([policies[pi].policyId, policies[pi].guid]);
      }
      self.updateSwapSelect(container, itemsFrom);
    }, function(e) {
      self.showAlert('error', '<strong>Error loading Groups</strong> ' + e);
    });
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
 
    async.parallel([function (cb) {
      // roles
      self.models.role.list_assignable(function(res) {
        console.log('Role list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }, function (cb) {
      // roles
      self.models.policy.list(function(res) {
        console.log('Policy list OK.');
        return cb(null, res.list);
      }, function(e) {
        return cb(e);
      });
    }], function (err, results) {
      if (err != null) {
        return self.showAlert('error', '<strong>Error loading import user options</strong> ' + err);
      }
      console.log('populating user import form');

      var policiesFrom = [];
      for (var pi = 0, pl = results[1].length; pi < pl; pi += 1) {
        policiesFrom.push([results[1][pi].policyId, results[1][pi].guid]);
      }

      self.updateSwapSelect('#import_users_role_swap', results[0]);
      self.updateSwapSelect('#import_users_policy_swap', policiesFrom);
      self.bindSwapSelect(parent);
      $('input,select,button', parent).not('input[type=file]').removeAttr('disabled');
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
      rolesArr.push($(item).val());
    });
    var roles = rolesArr.length > 0 ? rolesArr.join(', ') : null;

    var policiesArr = [];
    $('#create_user_policy_swap .swap-to option', this.views.user_create).each(function (i, item) {
      policiesArr.push($(item).val());
    });
    var policies = policiesArr.length > 0 ? policiesArr.join(', ') : null;

    var storeitems = null;
    var groups = null;

    var activated = true;
    self.showAlert('info', '<strong>Creating User</strong> (' + id + ')');
    this.models.user.create(id, email, name, roles, policies, groups, storeitems, password, activated, invite, function(res) {
      if (res.warning) {
        self.showAlert('info', '<strong>Warning - invalid user email</strong> (' + id + ')');
      }
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
      rolesArr.push($(item).val());
    });
    var roles = rolesArr.length > 0 ? rolesArr.join(', ') : ''; // important to send '' here if no roles selected to ensure roles updated to remove all
    var policiesArr = [];
    $('#import_users_policy_swap .swap-to option', this.views.user_import).each(function (i, item) {
      policiesArr.push($(item).val());
    });
    var policies = policiesArr.length > 0 ? policiesArr.join(', ') : ''; // same as above ^^^
    var groups = null;
    var fileField = form.find('#import_users_file');

    var title = "Importing Users";
    var message = "Import Progress";
    var import_progress = 0;

    // we're allowing from 0 to 10 for file upload
    // and 11 to 100 for the progress of the import task
    // server responds with 0 to 100 for how far it's done
    // so need calculate a relative percent
    var rangeStart = 11;
    var rangeEnd = 100;
    var multiplier = (rangeEnd - rangeStart) / 100;

    self.showProgressModal(title, message, function () {
      self.clearProgressModal();
      self.appendProgressLog('Uploading file.');

      self.models.user.imports(invite, roles, policies, groups, fileField, function(data) {
        // file upload success
        var res = data.result;
        if (res.cachekey != null) {
          var cachekey = res.cachekey;
          self.appendProgressLog('File uploaded.');

          import_progress = 10;
          self.updateProgressBar(import_progress);

          // Poll cacheKey
          var import_task = new ASyncServerTask({
            cacheKey: cachekey
          }, {
            updateInterval: Properties.cache_lookup_interval,
            maxTime: Properties.cache_lookup_timeout,
            // 5 minutes
            maxRetries: Properties.cache_lookup_retries,
            timeout: function(res) {
              console.log('timeout error > ' + JSON.stringify(res));
              var msg = 'Importing timed out (' + Properties.cache_lookup_timeout + ')';
              self.appendProgressLog(msg);
              self.showAlert('error', '<strong>Error importing Users</strong> ');
            },
            update: function(res) {
              for (var i = 0; i < res.log.length; i++) {
                console.log(res.log[i]);
                self.appendProgressLog(res.log[i]);
                console.log("Current progress> " + import_progress);
              }
              import_progress = Math.floor(res.progress * multiplier) + rangeStart;
              self.updateProgressBar(import_progress);
            },
            complete: function(res) {
              import_progress = 100;
              self.updateProgressBar(import_progress);
              self.showUsersList();
              self.showAlert('success', '<strong>Successfully imported Users</strong>');
            },
            error: function(res) {
              console.log('import error > ' + JSON.stringify(res));
              self.appendProgressLog(res.error);
              self.showAlert('error', '<strong>Error importing Users</strong> ' + res.error);
            },
            retriesLimit: function() {
              console.log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
              var msg = 'Unable to track import progress (retry limit exceeded (' + Properties.cache_lookup_retries + '))';
              self.appendProgressLog(msg);
              self.showAlert('error', '<strong>Error importing Users</strong> ' + msg);
            },
            end: function() {
              setTimeout(function () {
                self.destroyProgressModal();
              }, 1000);
            }
          });
          import_task.run();
        } else {
          var msg = 'Unable to track import progress (cachekey missing)';
          self.showAlert('error', '<strong>Error importing Users</strong> ' + msg);
          setTimeout(function () {
            self.destroyProgressModal();
          }, 1000);
        }
      }, function (data) {
        // file upload failed
        var msg = data.result;
        self.appendProgressLog(msg);
        self.showAlert('error', '<strong>Error importing Users</strong> ' + msg);
        setTimeout(function () {
          self.destroyProgressModal();
        }, 1000);
      }, function (data) {
        // progress update on file upload
        // max of 10% for file upload
        import_progress = ((data.loaded/data.total) * 10);
        self.updateProgressBar(import_progress);
      });
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
      }).closest('.control-group').find('.control-label').text('Enabled');
    } else {
      $('#update_user_enabled').removeAttr('checked');
      $('.enable_user_button').text('Enable User').unbind().on('click', function () {
        self.enableUser();
      }).closest('.control-group').find('.control-label').text('Disabled');
    }
  },

  setUserBlacklisted: function (blacklisted) {
    var self = this;
    if (blacklisted) {
      $('#update_user_blacklisted').attr('checked', 'checked');
      $('.blacklist_user_button').text('Unmark for Data Purge').unbind().on('click', function () {
        self.whitelistUser();
      }).closest('.control-group').find('.control-label').text('Marked for Data Purge');
    } else {
      $('#update_user_blacklisted').removeAttr('checked');
      $('.blacklist_user_button').text('Mark for Data Purge').unbind().on('click', function () {
        self.blacklistUser();
      }).closest('.control-group').find('.control-label').text('Not Marked for Data Purge');
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
      self.changeBooleanField('enabled', true, 'Enabling User', function () {
        self.setUserEnabled(true);
      });
    });
  },

  disableUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to disable this user? This user will no longer be able to authenticate.', function () {
      self.changeBooleanField('enabled', false, 'Disabling User', function () {
        self.setUserEnabled(false);
      });
    });
  },

  blacklistUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to mark this User for data purge? (In supported apps, data will be purged at next login.)', function () {
      self.changeBooleanField('blacklisted', true, 'Marking User for Data Purge', function () {
        self.setUserBlacklisted(true);
      });
    });
  },

  whitelistUser: function () {
    var self = this;
    self.showBooleanModal('Are you sure you want to unmark this User for data purge?', function () {
      self.changeBooleanField('blacklisted', false, 'Unmarking User for Data Purge', function () {
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

    self.showAlert('info', '<strong>' + actionDesc + '</strong> (' + fields.username + ')');
    self.models.user.update(fields, function(res) {
      console.log(actionDesc + ' User OK');
      self.showAlert('success', '<strong>' + actionDesc + ' successful</strong> (' + fields.username + ')');
      success();
    }, function(err) {
      console.log(err);
      self.showAlert('error', '<strong>Error ' + actionDesc + '</strong> ' + err);
    });
  }
});
