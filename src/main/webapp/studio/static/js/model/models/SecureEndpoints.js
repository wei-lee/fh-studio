model.SecureEndpoints = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  // HUGE TODOS here

  read: function(success, fail) {
    var url = Constants.SECURE_ENDPOINTS_READ_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  readSecureEndpoints: function(success, fail) {
    var url = Constants.SECURE_ENDPOINTS_READ_URL;
     var dummy = {
      "status": "ok",
      "appId": "unqiue app identifier",
      "environment": "live", // can be "live" | "dev"
      "default": "appapikey", // can be "https" | "appapikey"
      "overrides": {
        "foo": {
          "security": "appapikey", // can be "https" | "appapikey",
          "updatedBy": "user@example.com",
          "date": "2012-12-04 12:00"
        },
        "bar": {
          "security": "https", // can be "https" | "appapikey",
          "updatedBy": "user@example.com",
          "date": "2012-12-04 12:00"
        },
        "getConfig": {
          "security": "https", // can be "https" | "appapikey",
          "updatedBy": "user@example.com",
          "date": "2012-12-04 12:00"
        }
      }
    };
    return success(dummy); // TODO dummy data for now
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  readAppEndpoints: function(success, fail) {
    var dummy = ["foo", "getConfig"];
    return success({endpoints: dummy}); // TODO - dummy data for now

    var url = Constants.APP_ENDPOINTS_READ_URL;
    var params = {};
    return this.serverPost(url, params, success, fail);
  },

  // TODO
  update: function(guid, name, description, store_items, auth_policies, authed_access, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_UPDATE_URL;
    var params = {
      guid: guid,
      name: name,
      description: description,
      storeitems: store_items,
      authpolicies: auth_policies,
      authedaccess :authed_access
    };
    return this.serverPost(url, params, success, fail, true);
  },

  setDefaultSecureEndpoint: function(guid, cloudEnv, def, success, fail) {
    return success(); // TODO - dummy for now..
    var url = Constants.SECURE_ENDPOINTS_SET_DEFAULT_SECURE_ENDPOINT_URL;
    var params = {
      guid: guid,
      environment: cloudEnv,
      default: def
    };
    return this.serverPost(url, params, success, fail, true);
  },

  setEndpointOverride: function(guid, cloudEnv, endpoints, val, success, fail) {
    var overrides = {};
    
    for (var i=0; i<endpoints.length; i++) {
      var endpoint = endpoints[i];
      overrides[endpoint] = {
        security: val
      };
    }

    var params = {
      guid: guid,
      environment: cloudEnv,
      overrides: overrides
    };

    return success(); // TODO - dummy for now..
    var url = Constants.SECURE_ENDPOINTS_SET_DEFAULT_SECURE_ENDPOINT_URL;
    
    return this.serverPost(url, params, success, fail, true);
  }
});