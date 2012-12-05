model.SecureEndpoints = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  readSecureEndpoints: function(guid, cloudEnv, success, fail) {
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
    var params = {
      appId: guid,
      "environment": cloudEnv
    };
    return this.serverPost(url, params, success, fail);
  },

  readAuditLog: function(guid, cloudEnv, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_AUDIT_LOG_READ_URL;
    var dummy = {
      "status": "ok",
      "auditlog": [
        {
          "endpoint": "foo",
          "security": "appapikey", // can be "https" | "appapikey",
          "updatedBy": "user@example.com",
          "date": "2012-12-04 12:03"
        },
        {
          "endpoint": "bar",
          "security": "https", // can be "https" | "appapikey",
          "updatedBy": "user@example.com",
          "date": "2012-12-04 12:02"
        },
        {
          "endpoint": "getConfig",
          "security": "https", // can be "https" | "appapikey",
          "updatedBy": "user@example.com",
          "date": "2012-12-04 12:01"
        }
      ]
    };    
    return success(dummy); // TODO dummy data for now
    var params = {
      appId: guid,
      "environment": cloudEnv
    };
    return this.serverPost(url, params, success, fail);
  },

  readAppEndpoints: function(guid, cloudEnv, success, fail) {
    var dummy = ["foo", "getConfig"];
    return success({endpoints: dummy}); // TODO - dummy data for now

    var url = Constants.APP_ENDPOINTS_READ_URL;
    var params = {
      appId: guid,
      "environment": cloudEnv
    };

    return this.serverPost(url, params, success, fail);
  },

  setDefaultSecureEndpoint: function(guid, cloudEnv, def, success, fail) {
    console.log(arguments)
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
    console.log(arguments)
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

    var dummyResp = {
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
    return success(dummyResp); // TODO - dummy for now..
    var url = Constants.SECURE_ENDPOINTS_SET_DEFAULT_SECURE_ENDPOINT_URL;
    
    return this.serverPost(url, params, success, fail, true);
  }
});