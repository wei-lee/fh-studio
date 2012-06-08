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
  table_column_field_map: {
    user: ["email", "name", "activated", "enabled", "lastLogin", "sysCreated"],
    group: ["name", "perms"]
  },

  // Offsets for editable fields
  editable_fields: {
    user: [0, 1, 2, 3],
    group: [0]
  },

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

      if ($(this).hasClass('update_user')) {
        // Update action
        self.updateUser(this, row, data);
        $(this).removeClass('btn-success update_user').text('Edit');
      } else {
        // Edit action
        self.editUser(this, row, data);
        $(this).addClass('btn-success update_user').text('Update');
      }
      return false;
    });
  },

  editUser: function(button, row, data) {
    this.makeUserRowEditable(row);
  },

  updateUser: function(button, row, data) {
    // debugger;
  },

  makeUserRowEditable: function(row) {
    var self = this;
    $('td', row).each(function(i, td) {
      // Field should be editable?
      if (self.editable_fields.user.indexOf(i) != -1) {
        // Checkbox row check
        var checkbox = $(td).find('input[type=checkbox]');

        if (checkbox.length > 0) {
          $(checkbox).removeAttr('disabled');
        } else {
          var text = $(td).text();
          var width = $(td).width();

          // Empty cell
          $(td).text('');
          $(td).append('<input type="text"/>');
          $(td).find('input').css('width', width + 'px').val(text);
        }
      }
    });
  },

  deleteUser: function(button, row, data) {},

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