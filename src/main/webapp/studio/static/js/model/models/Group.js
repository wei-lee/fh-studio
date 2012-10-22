model.Group = model.Model.extend({

  // Model config
  config: {},

  // Field config
  field_config: [{
    field_name: "guid",
    editable: false,
    visible: false,
    column_title: "Group ID"
  },{
    field_name: "name",
    column_title: "Group Name"
  },{
    field_name: "description",
    column_title: "Group Description"
  }],

  init: function() {},

  create: function(params, success, fail) {
    var url = Constants.ADMIN_GROUP_CREATE_URL.replace('<domain>', $fw.getClientProp('domain'));

    return this.serverPost(url, params, success, fail, true);
  },

  read: function(guid, success, fail, post_process) {
    var url = Constants.ADMIN_GROUP_READ_URL.replace('<domain>', $fw.getClientProp('domain'));
    var params = {guid: guid};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  list: function(success, fail, post_process) {
    var url = Constants.ADMIN_GROUP_LIST_URL.replace('<domain>', $fw.getClientProp('domain'));
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  remove: function(guid, success, fail) {
    var url = Constants.ADMIN_GROUP_DELETE_URL;
    var params = {
      "guid": guid
    };

    return this.serverPost(url, params, success, fail, true);
  },
  
  update: function(params, success, fail, post_process) {
    var url = Constants.ADMIN_GROUP_UPDATE_URL.replace('<domain>', $fw.getClientProp('domain'));

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  }
});
