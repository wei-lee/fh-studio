model.Deploy = model.Model.extend({

  config: {},

  field_config: [{
    field_name: "id",
    visible: false
  }, {
    field_name: "name",
    column_title: "Name"
  }, {
    field_name: "target",
    column_title: "Platform"
  }],

  init: function() {
    this._super();
  },

  listEditable: function(success, fail, post_process) {
    var params = {};
    if (post_process) {
      return this.serverPost(Constants.DEPLOY_TARGET_LIST_EDITABLE_URL, params, function(res) {
        return success(res);
      }, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(Constants.DEPLOY_TARGET_LIST_EDITABLE_URL, params, success, fail, true);
    }
  },

  list: function(app_guid, env, success, fail) {
    var params = {
      "env": env,
      "app": app_guid
    };
    return this.serverPost(Constants.DEPLOY_TARGET_LISTFORAPP_URL, params, function(res) {
      if ($fw.getClientProp("demo-ui-enabled") === "true") {
        // Add sample PaaS
        res.list.push({
          "fields": {
            "configurations": {
              "url": "http://api.feedhenry.me:9080",
              "username": "feedhenry"
            },
            "domain": $fw.getClientProps().domain,
            "env": env,
            "id": "amazonaws",
            "name": "Amazon AWS",
            "selected": false,
            "target": "amazonaws"
          },
          "type": "cm_DeployPolicy"
        }, {
          "fields": {
            "configurations": {
              "url": "http://api.feedhenry.me:9080",
              "username": "feedhenry"
            },
            "domain": $fw.getClientProps().domain,
            "env": env,
            "id": "rackspace",
            "name": "Rackspace",
            "selected": false,
            "target": "rackspace"
          },
          "type": "cm_DeployPolicy"
        }, {
          "fields": {
            "configurations": {
              "url": "http://api.feedhenry.me:9080",
              "username": "feedhenry"
            },
            "domain": $fw.getClientProps().domain,
            "env": env,
            "id": "hpcloud",
            "name": "HP Cloud",
            "selected": false,
            "target": "hpcloud"
          },
          "type": "cm_DeployPolicy"
        });
      }
      return success(res);
    }, fail, true);
  },

  current: function(app_guid, env, success, fail) {
    var params = {
      "env": env,
      "app": app_guid
    };
    return this.serverPost(Constants.DEPLOY_TARGET_LISTFORAPP_URL, params, function(res) {
      // Find current
      $.each(res.list, function(i, target) {
        if (target.fields.selected) {
          return success(target);
        }
      });

    }, fail, true);
  },

  create: function(name, platform, env, config, success, fail) {
    var params = {
      "policyId": name,
      "target": platform,
      "env": env,
      "configurations": config
    };
    return this.serverPost(Constants.DEPLOY_TARGET_CREATE_URL, params, success, fail, true);
  },

  read: function(guid, success, fail, is_name) {
    var params = {};
    if (is_name) {
      params.policyId = guid;
    } else {
      params.guid = guid;
    }
    return this.serverPost(Constants.DEPLOY_TARGET_READ_URL, params, success, fail, true);
  },

  update: function(guid, name, platform, env, config, success, fail) {
    var params = {
      "guid": guid,
      "policyId": name,
      "target": platform,
      "env": env,
      "configurations": config
    };
    return this.serverPost(Constants.DEPLOY_TARGET_UPDATE_URL, params, success, fail, true);
  },

  'delete': function(guid, success, fail) {
    var params = {
      "guid": guid
    };
    return this.serverPost(Constants.DEPLOY_TARGET_DELETE_URL, params, success, fail, true);
  }

});