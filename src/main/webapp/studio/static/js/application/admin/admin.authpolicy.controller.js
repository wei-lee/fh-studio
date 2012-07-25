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

  form_template: ['<form class="well">', '<h3>%ACTION_CAP% an Authentication Policy</h3>', '<p>Here you can %ACTION% an authentication policy which can be used by your applications.</p>', '<br/>', '<label>Policy Id</label>', '<input id="policy_id" type="text" class="span6" placeholder="Policy Id">', '<label>Type</label>', '<label class="select">', '<select class="" id="policy_type">', '<option value="oauth2" selected="selected"> oAuth2 </option>', '<option value="ldap"> LDAP </option>', '</select>', '</label>', '<div id="oauth2_div">', '<label>Provider</label>', '<label class="select">', '<select id="policy_conf_provider">', '<option value="google">Google</option>', '</select>', '</label>', '<label>Client Id</label>', '<input id="client_id" type="text" class="span6" placeholder="Client Id (provided by Oauth service (ie Google etc...))">', '<label>Client Secret</label>', '<input id="client_secret" type="text" class="span6" placeholder="Client Secret (provided by Oauth service (ie Google etc...))">', '<label>Oauth Callback Url (Note* this should be added as the oauth callback url on the provider side i.e Google)</label>', '<input id="oauth_callback" type="text" class="span6" disabled="disabled"></div>', '<div id="ldap_div">', '<label>Authentication Method</label>', '<label class="select">', '<select id="authmethod_id">', '<option value="simple">Simple</option>', '<option value="DIGEST-MD5">Digest MD5 (SASL)</option>', '<option value="CRAM-MD5">CRAM MD5 (SASL)</option>', '<option value="GSSAPI">GSSAPI (Kerberos)</option>', '</select>', '</label>','<label>Distinguished Name (dn) prefix</label>', '<input id="dn_prefix_id" type="text" class="span6" placeholder="normally \'uid\' or \'cn\'">','<label>Distinguished Name (dn) </label>','<input id="dn_id" type="text" class="span6" placeholder="e.g. ou=people,dc=example,dc=com">', '</div>', '<label class="checkbox">','<input type="checkbox" id="require_user_id">Ensure User exists?</label>', '<input type="hidden" name="guid" id="guid" value=""/>', '<button type="button" class="btn btn-primary edit_policy_btn">%ACTION_CAP% Policy</button>', '</form>'],


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
      Log.append('Error showing users');
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
        $(view).find('.edit_policy_btn').unbind().click(function() {
          self.createPolicy(action);
          return false;
        });
      };

    var bindPolicyTypeEvent = function() {
        $(view).find('#policy_type').unbind().change(function(e) {
          var type = $('#policy_type').val();
          if (type === 'oauth2') {
            $('#oauth2_div').show();
            $('#ldap_div').hide();
          }else {
            $('#oauth2_div').hide();
            $('#ldap_div').show();
          }
          return false;
        });
      };

    var readPolicy = function(id) {
        self.models.policy.read(id, function(res) {
          self.hide();
          $(view).empty().append($(self.getFormTemplate(action)).clone());
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
        $(view).empty().append($(self.getFormTemplate(action)).clone());
        $('#oauth_callback', self.views.policies_create).val(conf.url);
        $('#oauth2_div', self.views.policies_create).show();
        $('#ldap_div', self.views.policies_create).hide();
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
      $('#guid', self.views.policies_update).val(policy.guid);
      $('#policy_id', self.views.policies_update).val(policy.policyId).attr("disabled", "true");
      $('#policy_type', self.views.policies_update).val(policy.policyType);   
      $('#require_user_id', self.views.policies_update).prop("checked", policy.requireUser === true);

      if (policy.policyType === 'oauth2') {
        $('#oauth2_div', self.views.policies_update).show();
        $('#ldap_div', self.views.policies_update).hide();
        $('#policy_conf_provider', self.views.policies_update).val(policy.configurations.provider);
        $('#client_id', self.views.policies_update).val(policy.configurations.clientId);
        $('#client_secret', self.views.policies_update).val(policy.configurations.clientSecret);
        $('#oauth_callback', self.views.policies_update).val(policy.configurations.callbackUrl);
      } else if (policy.policyType === 'ldap') {
        $('#oauth2_div', self.views.policies_update).hide();
        $('#ldap_div', self.views.policies_update).show();
        $('#authmethod_id', self.views.policies_update).val(policy.configurations.authmethod);
        $('#dn_prefix_id', self.views.policies_update).val(policy.configurations.dn_prefix);
        $('#dn_id', self.views.policies_update).val(policy.configurations.dn);
      }
    }
  },

  createPolicy: function(action) {
    var self = this;
    var view = self.views.policies_create;
    if (action == "update") {
      view = self.views.policies_update;
    }
    var guid = $('#guid', view).val() === "" ? undefined : $('#guid', view).val();
    var id = $('#policy_id', view).val();
    var type = $('#policy_type', view).val();
    var provider = $('#policy_conf_provider', view).val();
    var requireUser = $('#require_user_id', view).prop("checked");
    var conf;
    if (type === 'oauth2') {          
      var clientId = $('#client_id', view).val();
      var clientSecret = $('#client_secret', view).val();
      var callbackUrl = $('#oauth_callback', view).val();

      conf = {
        "provider": provider,
        "clientId": clientId,
        "clientSecret": clientSecret,
        "callbackUrl": callbackUrl
      };
    }else if (type === 'ldap') {
      var authmethod = $('#authmethod_id', view).val();
      var dn_prefix = $('#dn_prefix_id', view).val();
      var dn = $('#dn_id', view).val();

      conf = {
        "authmethod": authmethod,
        "dn_prefix": dn_prefix,
        "dn": dn
      };
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
  },

  getFormTemplate: function(act) {
    var template = this.form_template.join('').replace(/%ACTION%/g, act).replace(/%ACTION_CAP%/g, act.charAt(0).toUpperCase() + act.slice(1));
    return template;
  }
});