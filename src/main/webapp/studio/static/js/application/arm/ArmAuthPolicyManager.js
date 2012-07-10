application.ArmAuthPolicyManager = application.ArmManager.extend({
  models:{
    "policy":new model.ArmAuthPolicy()
  },

  views:{
    "policies":"#auth_policies_list",
    "policies_create":"#auth_policies_create",
    "policies_update":"#auth_policies_update"
  },

  form_template:['<form class="well">',
    '<h3>%ACTION_CAP% an Authentication Policy</h3>',
    '<p>Here you can %ACTION% an authentication policy which can be used by your applications.</p>',
    '<br/>',
    '<label>Policy Id</label>',
    '<input id="policy_id" type="text" class="span6" placeholder="Policy Id">',
    '<label>Type</label>',
    '<label class="select">',
    '<select class="" id="policy_type">',
    '<option value="oauth"> oAuth </option>',
    '</select>',
    '</label>',
    '<label>Provider</label>',
    '<label class="select">',
    '<select id="policy_conf_provider">',
    '<option value="google">Google</option>',
    '</select>',
    '</label>',
    '<label>Client Id</label>',
    '<input id="client_id" type="text" class="span6" placeholder="Client Id (provided by Oauth service (ie Google etc...))">',
    '<label>Client Secret</label>',
    '<input id="client_secret" type="text" class="span6" placeholder="Client Secret (provided by Oauth service (ie Google etc...))">',
    '<label>Oauth Callback Url (Note* this should be added as the oauth callback url on the provider side i.e Google)</label>',
    '<input id="oauth_callback" type="text" class="span6" disabled="disabled">',
    '<label>Users (Use comma to separate multiple users)</label>',
    '<label class="textarea">',
    '<textarea id="policy_users" rows=10></textarea>',
    '</label>',
    '<button type="button" class="btn btn-primary edit_policy_btn">%ACTION_CAP% Policy</button>',
    '</form>'],

  policy_table:null,

  hideViews:function () {
    $.each(this.views, function (k, v) {
      $(v).hide();
    });
  },

  showPolicyList:function () {
    var self = this;
    this.hideViews();
    $(this.views.policies).show();

    this.models.policy.list(function (res) {
      var data = self.addControls(res);
      self.renderUserTable(data);
      self.bindUserControls();
    }, function (err) {
      Log.append('Error showing users');
    }, true);
  },

  addControls:function (res) {
    // Add control column
    res.aoColumns.push({
      sTitle:"Controls",
      "bSortable":false,
      "sClass":"controls"
    });

    $.each(res.aaData, function (i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_policy">Edit</button>&nbsp;');
      // controls.push('<button class="btn btn-danger delete_user">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  },

  bindUserControls:function () {
    var self = this;
    $('tr td .edit_policy', this.policy_table).click(function () {
      var row = $(this).parent().parent();
      var data = self.policyDataForRow($(this).parent().parent().get(0));
      //console.log(data);
      self.showCreatePolicy(data[0]);
      return false;
    });
  },

  policyDataForRow:function (el) {
    return this.policy_table.fnGetData(el);
  },

  renderUserTable:function (data) {
    var self = this;

    this.policy_table = $('#auth_policies_list_table').dataTable({
      "bDestroy":true,
      "bAutoWidth":false,
      "sDom":"<'row-fluid'<'span12'>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType":"bootstrap",
      "bLengthChange":false,
      "aaData":data.aaData,
      "aoColumns":data.aoColumns
    });

    // Inject Create button
    var create_button = $('<button>').addClass('btn btn-primary right').text('Create').click(function () {
      self.showCreatePolicy();
      return false;
    });
    $('.span12:first', self.views.policies).append(create_button);
  },

  showCreatePolicy:function (policy_id) {
    var self = this;

    var view = self.views.policies_create;
    var action = "create";
    if (policy_id) {
      view = self.views.policies_update;
      action = "update";
    }

    var bindEvent = function () {
      $(view).find('.edit_policy_btn').unbind().click(function () {
        self.createPolicy(action);
        return false;
      });
    };

    var readPolicy = function (id) {

      self.models.policy.read(id, function (res) {

        self.hideViews();
        $(view).empty().append($(self.getFormTemplate(action)).clone());
        self.showEditPolicy(res);
        $(view).show();
        bindEvent();
      }, function (e) {
        $fw.client.dialog.error("Error reading policy with id " + id);
      });
    };

    if (policy_id) {
      readPolicy(policy_id);
    } else {
      self.models.policy.getConfig(function (conf) {

        self.hideViews();

        $(view).empty().append($(self.getFormTemplate(action)).clone());
        $('#oauth_callback', self.views.policies_create).val(conf.url);

        $(view).show();
        bindEvent();
      }, function (err) {

      });
    }

  },

  showEditPolicy:function (policy) {
    var self = this;
    var action = 'create';
    var acting = "Creating";
    if (policy) {
      action = "update";
      acting = "Updating";
      $('#policy_id', self.views.policies_update).val(policy.policyId).attr("disabled", "true");
      $('#policy_type', self.views.policies_update).val(policy.policyType);
      $('#policy_conf_provider', self.views.policies_update).val(policy.configurations.provider);
      $('#client_id', self.views.policies_update).val(policy.configurations.clientId);
      $('#client_secret', self.views.policies_update).val(policy.configurations.clientSecret);
      $('#oauth_callback', self.views.policies_update).val(policy.configurations.callbackUrl);
      var userList = policy.users.list;
      $('#policy_users', self.views.policies_update).text(userList.join(","));
    }
  },

  createPolicy:function (action) {
    var self = this;
    var view = self.views.policies_create;
    if (action == "update") {
      view = self.views.policies_update;
    }
    var id = $('#policy_id', view).val();
    var type = $('#policy_type', view).val();
    var provider = $('#policy_conf_provider', view).val();
    var users = $('#policy_users', view).val().replace(/\s/g, '').replace(/\n/g, '');
    var clientId = $('#client_id', view).val();
    var clientSecret = $('#client_secret', view).val();
    var callbackUrl = $('#oauth_callback', view).val();

    var conf = {'provider':provider, "clientId":clientId, "clientSecret":clientSecret, "callbackUrl":callbackUrl};
    var usersArr = users.split(",");

    this.models.policy[action](id, type, conf, {list:usersArr}, function (res) {
      //console.log(res);
      self.showPolicyList();
    }, function (e) {
      if (typeof e == 'undefined') {
        $fw.client.dialog.error("Error editing policy");
      } else {
        $fw.client.dialog.error("Error editing policy: " + e);
      }
    });
  },

  getFormTemplate:function (act) {
    var template = this.form_template.join('').replace(/%ACTION%/g, act).replace(/%ACTION_CAP%/g, act.charAt(0).toUpperCase() + act.slice(1));
    return template;
  }
});