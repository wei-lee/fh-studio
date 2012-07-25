var Admin = Admin || {};

Admin.Authpolicy = Admin.Authpolicy || {};

Admin.Authpolicy.Controller = Controller.extend({
  init: function() {},

  show: function(e) {
    this.showPolicyList();
  },

  models: {
    "policy": new model.ArmAuthPolicy()
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
      self.renderUserTable(data);
      self.bindUserControls();
    }, function(err) {
      Log.append('Error showing policies');
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
      //console.log(data);
      self.showCreatePolicy(data[0]);
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

  // TODO - remove
  renderUserTable: function(data) {
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
      self.showCreatePolicy();
      return false;
    });
    $('.span12:first', self.views.policies).append(create_button);
  },

  showCreatePolicy: function(policy_id) {
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
          self.createPolicy(action); // TODO - make separate updatePolicy
          return false;
        });
      }else {
        $(view).find('#create_policy_btn').unbind().click(function() {
          self.createPolicy(action);
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

    var readPolicy = function(id) {
        self.models.policy.read(id, function(res) {
          self.hide();
          self.container = view;
          //$(view).empty().append($(self.getFormTemplate(action)).clone());
          self.showEditPolicy(res);
          $(view).show();
          bindEvent();
          bindPolicyTypeEvent();
        }, function(e) {
          $fw.client.dialog.error("Error reading policy with id " + id);
        });
      };

    if (policy_id) {
      readPolicy(policy_id);      
    } else {
      self.models.policy.getConfig(function(conf) {
        self.hide();
        //$(view).empty().append($(self.getFormTemplate(action)).clone());
        self.container = view;
        $('#create_oauth_callback', self.views.policies_create).val(conf.url);
        $('#create_oauth2_div', self.views.policies_create).show();
        $('#create_ldap_div', self.views.policies_create).hide();
        $(view).show();
        bindEvent();
        bindPolicyTypeEvent();                       
      }, function(err) {

      });
    }

  },

  showAlert: function (type, message) {
  console.log("message: " + message + " type: " + type)
    var self = this;
    var alerts_area = $(this.container).find('#alerts');
console.log("ALERTS:");
  console.log(alerts_area)
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

  showBooleanModal: function (msg, success) {
    var modal = $('#generic_boolean_modal').clone();
    modal.find('.modal-body').html(msg).end().appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.btn-primary').unbind().on('click', function () {
      // confirmed delete, go ahead
      modal.modal('hide');
      success();
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function () {
        modal.remove();
      }, 2000);
    });
  },

  deletePolicy: function(button, row, data) {
    var self = this;
    self.showBooleanModal('Are you sure you want to delete this Policy?', function () {
      var id = data[0];
console.log("ID");
console.log(id);
      self.showAlert('info', '<strong>Deleting Profile</strong> (' + id + ') This may take some time.');
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


  showEditPolicy: function(policy) {
    var self = this;
    var action = 'create';
    var acting = "Creating";
    if (policy) {
      action = "update";
      acting = "Updating";
      $('#update_guid', self.views.policies_update).val(policy.guid);
      $('#update_policy_id', self.views.policies_update).val(policy.policyId).attr("disabled", "true");
      $('#update_policy_type', self.views.policies_update).val(policy.policyType);   
      $('#update_require_user_id', self.views.policies_update).prop("checked", policy.requireUser === true);

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

  createPolicy: function(action) {
    var self = this;
    var view = self.views.policies_create;
    var guid, id, type, provider, requireUser, conf;
    if (action == "update") {
      view = self.views.policies_update;    

      guid = $('#update_guid', view).val() === "" ? undefined : $('#update_guid', view).val();
      id = $('#update_policy_id', view).val();
      type = $('#update_policy_type', view).val();
      provider = $('#update_policy_conf_provider', view).val();
      requireUser = $('#update_require_user_id', view).prop("checked");
    
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
      requireUser = $('#create_require_user_id', view).prop("checked");
    
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
      if (typeof e == 'undefined') {
        $fw.client.dialog.error("Error editing policy");
      } else {
        $fw.client.dialog.error("Error editing policy: " + e);
      }
    }

    if(action === 'update') {
      this.models.policy.update(guid, id, type, conf, requireUser, onSuccess, onFailure); 
    }else {
      this.models.policy.create(id, type, conf, requireUser, onSuccess, onFailure); 
    }
  }
});