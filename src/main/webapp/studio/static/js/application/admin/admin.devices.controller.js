var Admin = Admin || {};

Admin.Devices = Admin.Devices || {};

Admin.Devices.Controller = Controller.extend({

  model: {
    device: new model.Device()
  },

  views: {
    device_list: "#admin_devices_list",
    device_update: "#admin_devices_update"
  },

  container: null,
  device_table: null,

  alert_timeout: 10000,

  init: function () {
    
  },

  show: function(){
    this.hideAlerts();
    this.showDeviceList();
  },

  hide: function(){
    $.each(this.views, function(k, v){
      $(v).hide();
    });
  },

  showDeviceList: function(){
    var self = this;
    self.hide();
    $(self.views.device_list).show();
    self.container = self.views.device_list;
    self.model.device.list(function(res){
      var data = self.addControls(res);
      self.renderDeviceTable(data);
      self.bindControls();
    }, function(err){
      console.log("Error showing devices");
    }, true);
  },

  addControls: function(res){
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_device">Edit</button>&nbsp;');
      controls.push('<button class="btn view_device_users">View Users</button>&nbsp;');
      controls.push('<button class="btn view_device_apps">View Apps</button>');
      row.push(controls.join(""));
    });
    return res;
  },

  renderDeviceTable: function(data) {
    var self = this;

    this.device_table = $('#admin_devices_table').dataTable({
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

  bindControls: function() {
    var self = this;
    $('tr td .edit_device, tr td .view_device_users, tr td .view_device_apps, tr td:not(.controls,.dataTables_empty)', this.device_table).unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.dataForRow($(this).closest('tr').get(0));
      self.showViewDevice(this, row, data);
      return false;
    });
  },

  dataForRow: function(el) {
    return this.device_table.fnGetData(el);
  },

  showViewDevice: function(button, row, data){
    console.log(data);
    var self = this;
    self.hide();
    var parent = $(self.views.device_update);
    self.container = self.views.device_update;
    self.resetForm(parent);
    self.resetLists(parent);
    var populateForm = function(device){
      var fields = device.fields;
      $('#update_device_name', parent).val(fields.name).removeAttr("disabled");
      $('#device_cuid', parent).val(fields.cuid);
      $('#device_last_access', parent).val(fields.sysModified);
      $('#device_first_seen', parent).val(fields.sysCreated);
      self.setDeviceDisabled(fields.cuid, fields.disabled, parent);
      self.setDeviceBlacklisted(fields.cuid, fields.blacklisted, parent);
    };
    var cuid = data[1];
    $('.update_device_name_btn', parent).removeAttr("disabled").unbind().bind("click", function(){
      var newname = $('#update_device_name', parent).val();
      self.model.device.updateLabel(cuid, newname, function(res){
        self.showAlert("success", "<strong>Successfully updated device detail.<strong>");
      }, function(){
        self.showAlert("error", "Failed to update device detail.");
      });
      return false;
    });
    self.model.device.read(cuid, function(res){
      populateForm(res);
    }, function(err){
      self.showAlert("error", "Failed to load device details " + err);
    });
    self.model.device.readUsers(cuid, function(res){
      self.showDeviceUsers(res);
    }, function(err){
      self.showAlert("error", "Failed to read users");
    });
    self.model.device.readApps(cuid, function(res){
      self.showStoreItems(res);
    }, function(err){
      self.showAlert("error", "Failed to list store items");
    });
    parent.show();
  },

  setDeviceDisabled: function(deviceId, disabled, parent){
    var self = this;
    if(disabled){
      $('#device_update_disabled', parent).attr("checked", "checked");
      $('.update_device_disabled_btn', parent).removeAttr("disabled").text('Enabled Authentication').unbind().bind("click", function(){
        self.model.device.updateDisabled(deviceId, false, function(res){
          self.showAlert("success", "<strong>Successfully enabling device.</strong>");
          self.setDeviceDisabled(deviceId, false, parent);
        }, function(err){
          self.showAlert("error", "Failed to enable device.");
        });
        return false;
      });
    } else {
      $('#device_update_disabled', parent).removeAttr("checked");
      var msg = "Are you sure you want to disable this device? In supported apps, users of this device will no longer be able to authenticate.";
      $('.update_device_disabled_btn', parent).removeAttr("disabled").text('Disable Authentication').unbind().bind("click", function(){
        self.showBooleanModal(msg, function(){
          self.model.device.updateDisabled(deviceId, true, function(res){
            self.showAlert("success", "<strong>Successfully disabling device.</strong>");
            self.setDeviceDisabled(deviceId, true, parent);
          }, function(err){
            self.showAlert("error", "Failed to disable device.");
          });
        });
        return false;
      });
    }
  },

  setDeviceBlacklisted: function(deviceId, blacklisted, parent){
    var self = this;
    if(blacklisted){
      $('#device_update_blacklisted', parent).attr("checked", "checked");
      $('.update_device_blacklisted_btn', parent).removeAttr("disabled").text('Unmark for Data Purge').unbind().bind("click", function(){
        self.model.device.updateBlacklisted(deviceId, false, function(res){
          self.showAlert("success", "<strong>Successfully unmarked device for data purge.</strong>");
          self.setDeviceBlacklisted(deviceId, false, parent);
        }, function(err){
          self.showAlert("error", "Failed to unmark data purge for device.");
        });
        return false;
      });
    } else {
      $('#device_update_blacklisted', parent).removeAttr("checked");
      var msg = "Are you sure you want to purge data on this device? In supported apps, data will purged at login";
      $('.update_device_blacklisted_btn', parent).removeAttr("disabled").text('Mark for Data Purge').unbind().bind("click", function(){
        self.showBooleanModal(msg, function(){
          self.model.device.updateBlacklisted(deviceId, true, function(res){
            self.showAlert("success", "<strong>Successfully marked device for data purge.</strong>");
            self.setDeviceBlacklisted(deviceId, true, parent);
          }, function(err){
            self.showAlert("error", "Failed to mark data purge for device.");
          });
        });
        return false;
      });
    }
  },

  showDeviceUsers: function(users){
    var self = this;
    var userlist = users.list;
    if(userlist.length > 0){
      $('#device_users').empty();
      $.each(userlist, function(k, v){
        var a = $("<a>", {"text": v.fields.userId, "href": "#"});
        var li = $("<li>");
        li.append(a);
        a.popover({
          title: v.fields.userId,
          content: self.getUserPopOverContent(v.fields)
        });
        a.unbind('click').bind('click', function(){
          self.hide();
          $fw.client.tab.admin.controllers['admin.users.controller'].showUserUpdate(null, null, [v.fields.userId]);
        });
        $('#device_users').append(li);

      });
    } else {
      var userhtml = $("<li>", {"text":"No users found"});
      $('#device_users').html(userhtml);
    }
  },

  showStoreItems: function(storeitems){
    var self = this;
    var storeitemlist = storeitems.list;
    
    if(storeitemlist.length > 0){
      $('#device_storeitems').empty();
      $.each(storeitemlist, function(k, v){
        var a = $("<a>", {"text": v.fields.name, "href":"#"});
        var li = $("<li>");
        li.append(a);
        a.popover({
          title : v.fields.name,
          content: self.getStoreItemPopoverContent(v.fields)
        });
        a.unbind('click').bind('click', function(){
          self.hide();
          var fields = v.fields;
          fields.guid = v.guid;
          $fw.client.tab.admin.controllers['admin.storeitems.controller'].showUpdateStoreItem(fields);
        });
        $('#device_storeitems').append(li);
      });
    } else {
      var storeitemhtml =$("<li>", {"text":"No store items found"});
      $('#device_storeitems').html(storeitemhtml);
    }
  },

  resetLists: function(parent){
    $('#device_users').empty().html('<li>Loading...</li>');
    $('#device_storeitems').empty().html('<li>Loading...</li>');
  },

  getUserPopOverContent: function(user){
    return "<ul><li> <strong>User Id - </strong>  " + user.userId+ "</li><li> <strong>Email - </strong> " + user.email + "</li><li> <strong>Name - </strong>" + user.name + "</li></ul>";
  },

  getStoreItemPopoverContent: function(item){
    var iconsrc = "/studio/static/themes/default/img/store_no_icon.png";
    if(item.icon !== ''){
      iconsrc = "data:image/png;base64,"+ item.icon;
    }
    return "<div class='device_store_item_popover'><div class='icon_container'><img class='icon' src='"+ iconsrc + "'></div>" + "<div class='details'> <h3 class='name'> " + item.name + "</h3> <p>" + item.description + "</p></div></div>"; 
  }

});