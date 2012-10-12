var Admin = Admin || {};
Admin.Storeitem = Admin.Storeitem|| {};
Admin.Storeitem.Groups  = Admin.Storeitem.Groups || {};

Admin.Storeitem.Groups.Controller = Controller.extend({
  models: {
    group: new model.Group()
  },

  views: {
    groups: "#admin_storeitem_group_list",
    group_create: "#admin_storeitem_group_create",
    group_update: "#admin_storeitem_group_update"
  },

  alert_timeout: 3000,

  container: null,

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
    $('#admin_storeitem_group_create .create_group_btn').unbind().click(function() {
      var name = $('#create_group_name').val();
      var description = $('#create_group_desc').val();
      self.createGroup({name:name, description:description});
      return false;
    });


    $('tr td .edit_group', this.user_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.groupDataForRow($(this).parent().parent().get(0));
      self.showGroupUpdate(this, row, data);
      return false;
    });
    $('tr td .delete_group', this.user_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.groupDataForRow($(this).parent().parent().get(0));
      self.deleteGroup(this, row, data);
      return false;
    });
  },

  showBooleanModal: function (msg, success) {
    var modal = $('#admin_storeitem_group_boolean_modal').clone();
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

  deleteGroup: function(button, row, data) {
    var self = this;
    self.showBooleanModal('Are you sure you want to delete this Group?', function () {
      self.showAlert('info', '<strong>Deleting Group</strong> This may take some time.');
      // delete user
      var guid = data[0];
      self.models.group.remove(guid, function(res) {
        self.showAlert('success', '<strong>Group Successfully Deleted</strong>');
        // remove user from table
        self.group_table.fnDeleteRow(row[0]);
      }, function(e) {
        self.showAlert('error', '<strong>Error Deleting Group</strong> ' + e);
      });
    });
  },

  createGroup: function(group) {
    var self = this;
    this.models.group.create(group, function(res) {
      console.log('createGroup: OK');
      $fw.client.dialog.info.flash('Group created, refreshing list.');
      self.showGroupsList();
    }, function(err) {
      console.log(err);
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
    this.container = this.views.groups;
    this.models.group.list(function(res) {
      var data = self.addControls(res);
      self.renderGroupTable(data);
      self.bindGroupControls();
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderGroupTable: function(data) {
    var self = this;
    this.group_table = $('#admin_storeitem_groups_table').dataTable({
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
    $('#admin_storeitem_group_list .span12:first').append(create_button);
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

  showCreateGroup: function() {
    this.hide();
    $('#admin_storeitem_group_create').show();
  },

  showGroupUpdate: function(button, row, data) {
    var self = this;
    this.hide();

    var parent = $(this.views.group_update);
    this.container = this.views.group_update;

    var clearForm = function () {
      $('input[type=text]', parent).val('');
      $('input[type=hidden]', parent).val('');
    };

    var populateForm = function (group) {
      console.log('populating group update form: ' + JSON.stringify(group));
      $('#update_group_id', parent).val(group.guid);
      $('#update_group_name', parent).val(group.name);
      $('#update_group_description', parent).val(group.description);
    };

    clearForm();
	  parent.show();

    $('.update_group_btn', parent).unbind().click(function() {
      self.updateGroup();
      return false;
    });

    // Setup group details - currently just name
    console.log("data: " + JSON.stringify(data));
    var id = data[0];
    var oldName = data[1];

    return populateForm({guid: data[0], name: data[1], description: data[2]});
  },

  updateGroup: function() {
    var self = this;

    var form = $(this.views.group_update + ' form');
    var fields = {};

    // required fields first
    // text inputs
    fields.guid = form.find('#update_group_id').val();

    // text inputs
    var name = form.find('#update_group_name').val();
    if (name !== '') {
      fields.name = name;
    }
    var description = form.find('#update_group_description').val();
    if (description !== '') {
      fields.description = description;
    }

    this.models.group.update(fields, function(res) {
      console.log('updateUser: OK');
      self.showGroupsList();
      self.showAlert('success', '<strong>Group successfully updated</strong> (' + fields.name + ')');
    }, function(err) {
      console.log(err);
      self.showAlert('error', '<strong>Error updating Group</strong> ' + err);
    });
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
      controls.push('<button class="btn edit_group">Edit</button>&nbsp;');
      controls.push('<button class="btn btn-danger delete_group">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  }
});