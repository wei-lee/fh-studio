var Admin = Admin || {};

Admin.Authpolicy = Admin.Authpolicy || {};

Admin.Authpolicy.Controller = Controller.extend({
  init: function() {},

  show: function(e) {
    this.showPolicyList();
  },

  models: {
    user: new model.User(),
    policy: new model.ArmAuthPolicy()
  },

  views: {
    "policies": "#auth_policies_list",
    "policies_create": "#auth_policies_create",
    "policies_update": "#auth_policies_update"
  },

  policy_table: null,

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  showPolicyList: function() {
    var self = this;
    this.hide();
    $(this.views.policies).show();

    this.models.policy.list(function(res) {
      var data = self.addControls(res);
      self.renderPolicyTable(data);
      self.bindUserControls();
    }, function(err) {
      console.error('Error showing policies: ' + err);
    }, true);
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
      controls.push('<button class="btn edit_policy">Edit</button>&nbsp;');
      controls.push('<button class="btn btn-danger delete_policy">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  },

  bindUserControls: function() {
    var self = this;
    $('tr td .edit_policy', this.policy_table).click(function() {
      var row = $(this).parent().parent();
      var data = self.policyDataForRow($(this).parent().parent().get(0));
      self.showCreateUpdatePolicy(data[0]);
      return false;
    });

    $('tr td .delete_policy', this.policy_table).click(function() {
      var row = $(this).parent().parent();
      var data = self.policyDataForRow($(this).parent().parent().get(0));
      self.deletePolicy(this, row, data);
      return false;
    });

  },

  policyDataForRow: function(el) {
    return this.policy_table.fnGetData(el);
  },

  renderPolicyTable: function(data) {
    var self = this;

    this.policy_table = $('#auth_policies_list_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns
    });

    // Inject Create button
    var create_button = $('<button>').addClass('btn btn-primary right').text('Create').click(function() {
      self.showCreateUpdatePolicy();
      return false;
    });
    $('.span12:first', self.views.policies).append(create_button);
  },

  showCreateUpdatePolicy: function(policy_id) {
    var self = this;

    var view = self.views.policies_create;
    var action = "create";
    if (policy_id) {
      view = self.views.policies_update;
      action = "update";
    }

    var bindEvent = function() {
      if (action === 'update') {
        $(view).find('#update_policy_btn').unbind().click(function() {
          self.createOrUpdatePolicy(action);
          return false;
        });
      }else {
        $(view).find('#create_policy_btn').unbind().click(function() {
          self.createOrUpdatePolicy(action);
          return false;
        });
      }
    };

    var bindPolicyTypeEvent = function() {
      if (action === 'update') {
        $(view).find('#update_policy_type').unbind().change(function(e) {
          var type = $('#update_policy_type').val();
          if (type === 'oauth2') {
            $('#update_oauth2_div').show();
            $('#update_ldap_div').hide();
          }else {
            $('#update_oauth2_div').hide();
            $('#update_ldap_div').show();
          }
          return false;
        });    
      }else {
        $(view).find('#create_policy_type').unbind().change(function(e) {
          var type = $('#create_policy_type').val();
          if (type === 'oauth2') {
            $('#create_oauth2_div').show();
            $('#create_ldap_div').hide();
          }else {
            $('#create_oauth2_div').hide();
            $('#create_ldap_div').show();
          }
          return false;
        });
      }
    };

    function getUserList (cb) {
      self.models.user.list(function(res) {
        // create an array of userids from the users return json
        var users = [];
        for (var i=0; i<res.list.length; i++) {
          var u = res.list[i];
          users.push(u.fields.username);
        }
        return cb(null, users);
      }, function(e) {
         return cb(e);
      });
    }

    var readPolicy = function(id) {
      async.parallel([
        getUserList,
        function (cb) {
          self.models.policy.read(id, function(res) {
            return cb(null, res);
          }, function(e) {
            return cb(e);
          });
        }], function(err, results){
          if (err != null) {
            return self.showAlert('error', '<strong>Error loading user data</strong> ' + err);
          }       
          self.hide();
          //self.container = view;
          self.showEditPolicy(results[0], results[1]);
          $(view).show();
          bindEvent();
          bindPolicyTypeEvent();
        });
      };

    if (policy_id) {
      // existing policy
      readPolicy(policy_id);      
    } else {
      // new policy
      async.parallel([
        getUserList,
        function (cb) {
          self.models.policy.getConfig(function(conf) {
            return cb(null, conf);
          }, function(e) {
            return cb(e);
          });
        }
      ], function(err, results){
        self.hide();
//        self.container = view;
        self.updateSwapSelect('#create_approved_users_auth_policies_swap', results[0], []);
        self.bindSwapSelect(self.views.policies_create);      

        $('#create_oauth_callback', self.views.policies_create).val(results[1].url);
        $('#create_oauth2_div', self.views.policies_create).show();
        $('#create_ldap_div', self.views.policies_create).hide();
        $(view).show();
        bindEvent();
        bindPolicyTypeEvent();  
      });      
    }
  },

  // TODO - container necessary??
//  container: null, // keeps track of currently active/visible container
  alert_timeout: 10000,

  showAlert: function (type, message) {
    var self = this;
    var alerts_area = $('#auth_policies_alerts');
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

  deletePolicy: function(button, row, data) {
    var self = this;
    self.showBooleanModal('Are you sure you want to delete this Policy?', function () {
      var id = data[0];
      self.showAlert('info', '<strong>Deleting Profile</strong> (' + id + ').. ');
      // delete user
      self.models.policy.remove(id, function(res) {
        self.showAlert('success', '<strong>Policy Successfully Deleted</strong> (' + id + ')');
        // remove user from table
        self.policy_table.fnDeleteRow(row[0]);
      }, function(e) {
        self.showAlert('error', '<strong>Error Deleting Policy</strong> (' + id + ') ' + e);
      });
    });
  },

  showEditPolicy: function(users, policy) {
    var self = this;
    var action = 'create';
    var acting = "Creating";
    if (policy) {
      action = "update";
      acting = "Updating";
      $('#update_guid', self.views.policies_update).val(policy.guid);
      $('#update_policy_id', self.views.policies_update).val(policy.policyId).attr("disabled", "true");
      $('#update_policy_type', self.views.policies_update).val(policy.policyType);   
      $('#update_check_user_exists_id', self.views.policies_update).prop("checked", policy.checkUserExists === true);
       
      // create an array of user names from the users return json
      var pusers = [];
      for (var i=0; i<policy.users.length; i++) {
        var u = policy.users[i];
        pusers.push(u.userid);
      }

      self.updateSwapSelect('#update_approved_users_auth_policies_swap', users, pusers);
      self.bindSwapSelect(self.views.policies_update);      

      if (policy.policyType === 'oauth2') {
        $('#update_oauth2_div', self.views.policies_update).show();
        $('#update_ldap_div', self.views.policies_update).hide();
        $('#update_policy_conf_provider', self.views.policies_update).val(policy.configurations.provider);
        $('#update_client_id', self.views.policies_update).val(policy.configurations.clientId);
        $('#update_client_secret', self.views.policies_update).val(policy.configurations.clientSecret);
        $('#update_oauth_callback', self.views.policies_update).val(policy.configurations.callbackUrl);
      } else if (policy.policyType === 'ldap') {
        $('#update_oauth2_div', self.views.policies_update).hide();
        $('#update_ldap_div', self.views.policies_update).show();
        $('#update_authmethod_id', self.views.policies_update).val(policy.configurations.authmethod);
        $('#update_dn_prefix_id', self.views.policies_update).val(policy.configurations.dn_prefix);
        $('#update_dn_id', self.views.policies_update).val(policy.configurations.dn);
      }
    }
  },

  createOrUpdatePolicy: function(action) {
    var self = this;
    var view = self.views.policies_create;
    var guid, id, type, provider, checkUserExists, checkUserApproved, conf;
    var users = [];
    if (action == "update") {
      view = self.views.policies_update;    

      guid = $('#update_guid', view).val() === "" ? undefined : $('#update_guid', view).val();
      id = $('#update_policy_id', view).val();
      type = $('#update_policy_type', view).val();
      provider = $('#update_policy_conf_provider', view).val();
      checkUserExists = $('#update_check_user_exists_id', view).prop("checked");
      checkUserApproved = $('#update_check_user_approved_id', view).prop("checked");
      
      $('#update_approved_users_auth_policies_swap .swap-to option', view).each(function (i, item) {
        users.push($(item).text());
      });

      if (type === 'oauth2') {          
        conf = {
          "provider": provider,
          "clientId": $('#update_client_id', view).val(),
          "clientSecret": $('#update_client_secret', view).val(),
          "callbackUrl": $('#update_oauth_callback', view).val()
        };
      }else if (type === 'ldap') {
        conf = {
          "authmethod": $('#update_authmethod_id', view).val(),
          "dn_prefix": $('#update_dn_prefix_id', view).val(),
          "dn": $('#update_dn_id', view).val()
        };
      }
    }else {
      view = self.views.policies_create;

      id = $('#create_policy_id', view).val();
      type = $('#create_policy_type', view).val();
      provider = $('#create_policy_conf_provider', view).val();
      checkUserExists = $('#create_check_user_exists_id', view).prop("checked");
      checkUserApproved = $('#create_check_user_approved_id', view).prop("checked");
      
      $('#create_approved_users_auth_policies_swap .swap-to option', view).each(function (i, item) {
        users.push($(item).text());
      });
      if (type === 'oauth2') {          
        conf = {
          "provider": provider,
          "clientId": $('#create_client_id', view).val(),
          "clientSecret": $('#create_client_secret', view).val(),
          "callbackUrl": $('#create_oauth_callback', view).val()
        };
      }else if (type === 'ldap') {
        conf = {
          "authmethod": $('#create_authmethod_id', view).val(),
          "dn_prefix": $('#create_dn_prefix_id', view).val(),
          "dn": $('#create_dn_id', view).val()
        };
      }
    }

    function onSuccess(res) {
      self.showPolicyList();
    }

    function onFailure(e) {
      var act = action === 'create' ? 'creating' : 'updating';
      if (typeof e == 'undefined') {
        $fw.client.dialog.error("Error " + act + " policy");
      } else {
        $fw.client.dialog.error("Error " + act + " policy: " + e);
      }
    }

    if(action === 'update') {
      this.models.policy.update(guid, id, type, conf, checkUserExists, checkUserApproved, users, onSuccess, onFailure); 
    }else {
      this.models.policy.create(id, type, conf, checkUserExists, checkUserApproved, users, onSuccess, onFailure); 
    }
  }
});