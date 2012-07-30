model.Device = model.Model.extend({

  // Model config
  config: {},

  // Field config
  field_config: [{
    field_name: "name",
    editable: false,
    showable: true,
    column_title: "Label"
  }, {
    field_name: "cuid",
    editable: false,
    showable: true,
    column_title: "Device Id"
  }, {
    field_name: "disabled",
    editable: false,
    showable: true,
    column_title: "Disabled"
  }, {
    field_name: "blacklisted",
    editable: false,
    showable: true,
    column_title: "Purge Data"
  }, {
    field_name: "sysModified",
    editable: false,
    showable: true,
    column_title: "Last Access"
  }],

  init: function(){

  },

  read: function(deviceId, success, fail){
    var fields = {"cuid": deviceId};
    return this.serverPost(Constants.ADMIN_DEVICES_READ_URL, fields, success, fail, true);
  },

  updateLabel: function(deviceId, newlabel, success, fail){
    var fields = {"cuid": deviceId, "name": newlabel};
    return this.serverPost(Constants.ADMIN_DEVICES_UPDATE_URL, fields, success, fail, true);
  },

  updateDisabled: function(deviceId, disabled, success, fail){
    var fields = {"cuid": deviceId, "disabled": disabled};
    return this.serverPost(Constants.ADMIN_DEVICES_UPDATE_URL, fields, success, fail, true);
  },

  updateBlacklisted: function(deviceId, blacklisted, success, fail){
    var fields = {"cuid": deviceId, "blacklisted": blacklisted};
    return this.serverPost(Constants.ADMIN_DEVICES_UPDATE_URL, fields, success, fail, true);
  },

  readUsers: function(deviceId, success, fail){
    var fields = {"cuid": deviceId};
    return this.serverPost(Constants.ADMIN_DEVICES_LISTUSERS_URL, fields, success, fail, true);
  },

  readApps: function(deviceId, success, fail){
    var fields = {"cuid": deviceId};
    return this.serverPost(Constants.ADMIN_DEVICES_LISTAPPS_URL, fields, success, fail, true);
  },

  list: function(success, fail, post_process){
    var url = Constants.ADMIN_DEVICES_LIST_URL;
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  }
});