var Admin = Admin || {};

Admin.Groups = Admin.Groups || {};

Admin.Groups.Controller = Controller.extend({
  models: {
    group: new model.Group()
  },

  views: {
    groups: "#useradmin_group_list",
    group_create: "#useradmin_group_create"
  },

  group_table: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.field_config = params.field_config || null;
  },

  show: function (e) {
    this.showGroupsList();
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
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

  bindGroupControls: function() {
    var self = this;
    $('#useradmin_group_create .create_group_btn').unbind().click(function() {
      var group_name = $('.group_name').val();
      self.createGroup(group_name);
      return false;
    });
  },

  createGroup: function(group_name) {
    var self = this;
    this.models.group.create(group_name, function(res) {
      Log.append('createGroup: OK');
      $fw.client.dialog.info.flash('Group created, refreshing list.');
      self.showGroupsList();
    }, function(err) {
      Log.append(err);
      $fw.client.dialog.error("Error creating your group - group names must be unique.");
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

  groupDataForRow: function(el) {
    return this.group_table.fnGetData(el);
  },

  showGroupsList: function() {
    var self = this;
    this.hide();
    $(this.views.groups).show();
    this.models.group.list(function(res) {
      self.renderGroupTable(res);
      self.bindGroupControls();
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderGroupTable: function(data) {
    var self = this;
    this.group_table = $('#useradmin_groups_table').dataTable({
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
      self.showCreateGroup();
      return false;
    });
    $('#useradmin_group_list .span12:first').append(create_button);
  },

  showCreateGroup: function() {
    this.hide();
    $('#useradmin_group_create').show();
  }
});