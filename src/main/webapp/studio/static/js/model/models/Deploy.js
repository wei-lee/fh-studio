model.Deploy = model.Model.extend({

  init: function() {
    this._super();
  },

  list: function(app_guid, env, success, fail) {
    var mock = {
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

    success(mock.list);
  },

  create: function(params, success, fail) {},

  read: function(guid, success, fail, is_name) {},

  update: function(fields, success, fail) {},

  'delete': function(guid, success) {}
});