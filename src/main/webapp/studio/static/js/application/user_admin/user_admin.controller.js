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

  init: function(params) {
    var self = this;
    var params = params || {};
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
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderUserTable: function(data) {
    var self = this;

    $('#useradmin_users_table').dataTable({
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

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      controls.push('<button class="btn">Update</button>&nbsp;');
      controls.push('<button class="btn btn-danger">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  },

  renderCheckboxes: function(row, data) {
    $('td', row).each(function(i, item) {
      // TODO: Move to clonable hidden_template
      if (data[i] == true) {
        $(item).html('<input type="checkbox" checked/>');
      }

      if (data[i] == false) {
        $(item).html('<input type="checkbox"/>');
      }
    });
  },

  showGroupsList: function() {
    this.hideViews();
    $(this.views.groups).show();

    this.models.group.list(function(res) {
      var data = self.addControls(res);
      self.renderGroupTable(data);
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderGroupTable: function(data) {
    $('#useradmin_groups_table').dataTable({
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