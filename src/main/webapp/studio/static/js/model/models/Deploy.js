model.Deploy = model.Model.extend({

  config: {},

  field_config: [{
    field_name:"id",
    visible: false
  },{
    field_name: "name",
    editable: false,
    showable: true,
    column_title: "Name"
  }, {
    field_name: "target",
    editable: false,
    showable: true,
    column_title: "Platform"
  }],

  init: function() {
    this._super();
  },

  listEditable: function(success, fail, post_process){
    var params = {};
    if (post_process) {
      return this.serverPost(Constants.DEPLOY_TARGET_LIST_EDITABLE_URL, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(Constants.DEPLOY_TARGET_LIST_EDITABLE_URL, params, success, fail, true);
    }
  },

  list: function(app_guid, env, success, fail) {
    /*var mock = {};

    if (env == 'live') {
      mock = {
        "list": [{
          "fields": {
            "configurations": {
              "url": "https://api.dynofarm.me:9443",
              "username": "feedhenry"
            },
            "domain": "hpcs",
            "env": "dev,live",
            "id": "default",
            "name": "default",
            "target": "FEEDHENRY"
          },
          "type": "cm_DeployPolicy"
        }, {
          "fields": {
            "configurations": {
              "url": "http://thing.com",
              "username": "foo@example.com"
            },
            "domain": "hpcs",
            "env": "dev,live",
            "id": "yjEUwXsSd70VLmIXGXCBI343",
            "name": "MyCF",
            "target": "CLOUDFOUNDRY"
          },
          "type": "cm_DeployPolicy"
        }]
      };
    } else {
      mock = {
        "list": [{
          "fields": {
            "configurations": {
              "url": "https://api.dynofarm.me:9443",
              "username": "feedhenry"
            },
            "domain": "hpcs",
            "env": "dev,live",
            "id": "default",
            "name": "default",
            "target": "FEEDHENRY"
          },
          "type": "cm_DeployPolicy"
        }]
      };
    }

    success(mock.list);*/
    var params = {"env": env, "app": app_guid};
    return this.serverPost(Constants.DEPLOY_TARGET_LISTFORAPP_URL, params, success, fail, true);
  },

  create: function(name, platform, env, config, success, fail) {
    var params = {"policyId": name, "target": platform, "env":env, "configurations": config};
    return this.serverPost(Constants.DEPLOY_TARGET_CREATE_URL, params, success, fail, true);
  },

  read: function(guid, success, fail, is_name) {
    var params = {};
    if(is_name){
      params.policyId = guid;
    } else {
      params.guid = guid;
    }
    return this.serverPost(Constants.DEPLOY_TARGET_READ_URL, params, success, fail, true);
  },

  update: function(guid, name, platform, env, config, success, fail) {
    var params = {"guid":guid, "policyId":name, "target": platform, "env": env, "configurations": config};
    return this.serverPost(Constants.DEPLOY_TARGET_UPDATE_URL, params, success, fail, true);
  },

  'delete': function(guid, success, fail) {
    var params = {"guid":guid};
    return this.serverPost(Constants.DEPLOY_TARGET_DELETE_URL, params, success, fail, true);
  }
});