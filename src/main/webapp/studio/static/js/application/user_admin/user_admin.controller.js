var UserAdmin = UserAdmin || {};

UserAdmin.Controller = Class.extend({

  models: {
    user: new model.User(),
    group: new model.Group()
  },
  views: {
    users: "#useradmin_user_list",
    groups: "#useradmin_group_list"
  },
  config: null,
  user_table: null,
  group_table: null,

  // Offsets for field names
  user_table_map: ["email", "name", "activated", "enabled", "lastLogin", "sysCreated"],
  group_table_map: ["name", "perms"],

  init: function(params) {
    var self = this;
    params = params || {};
    this.config = params.config || null;
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
      console.error(err);
    }, true);
  },

  bindUserControls: function() {
    var self = this;
    $('tr td .edit_user', this.user_table).click(function() {
      var row = $(this).parent().parent();
      var data = self.userDataForRow($(this).parent().parent().get(0));
      self.editUser(row, data);
    });
  },

  editUser: function(row, data) {
    console.log(data);
  },

  deleteUser: function(row, data) {},

  bindGroupControls: function() {},


  renderUserTable: function(data) {
    var self = this;

    this.user_table = $('#useradmin_users_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });
  },

  rowRender: function(row, data) {
    this.renderCheckboxes(row, data);
  },

  renderCheckboxes: function(row, data) {
    $('td', row).each(function(i, item) {
      // TODO: Move to clonable hidden_template
      if (data[i]) {
        $(item).html('<input type="checkbox" checked/>');
      }

      if (data[i]) {
        $(item).html('<input type="checkbox"/>');
      }
    });
  },

  userDataForRow: function(el) {
    return this.user_table.fnGetData(el);
  },

  groupDataForRow: function(el) {
    return this.group_table.fnGetData(el);
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

  showGroupsList: function() {
    this.hideViews();
    $(this.views.groups).show();

    this.models.group.list(function(res) {
      var data = self.addControls(res);
      self.renderGroupTable(data);
      self.bindGroupControls();
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderGroupTable: function(data) {
    this.group_table = $('#useradmin_groups_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns
    });
  }
});