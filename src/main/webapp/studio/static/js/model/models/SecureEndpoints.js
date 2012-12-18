model.SecureEndpoints = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  readSecureEndpoints: function(guid, cloudEnv, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_GET_URL;
    var params = {
      appId: guid,
      environment: cloudEnv
    };
    return this.serverPost(url, params, success, fail, true);
  },

  readAuditLog: function(guid, cloudEnv, filter, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_GET_AUDIT_LOG_URL;
    var params = {
      appId: guid,
      environment: cloudEnv
    };
    if (filter) {
      params.filter = filter;
    }
    return this.serverPost(url, params, success, fail, true);
  },

  readAppEndpoints: function(guid, cloudEnv, success, fail) {
    var url = Constants.APP_ENDPOINTS_URL;
    var params = {
      guid: guid,
      deploytarget: cloudEnv
    };

    return this.serverPost(url, params, success, fail, true);
  },

  setDefaultSecureEndpoint: function(guid, cloudEnv, def, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_SET_DEFAULT_URL;
    var params = {
      appId: guid,
      environment: cloudEnv,
      "default": def
    };
    return this.serverPost(url, params, success, fail, true);
  },

  setEndpointOverride: function(guid, cloudEnv, endpoints, val, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_SET_OVERRIDE_URL;
    var overrides = {};
    
    for (var i=0; i<endpoints.length; i++) {
      var endpoint = endpoints[i];
      overrides[endpoint] = {
        security: val
      };
    }

    var params = {
      appId: guid,
      environment: cloudEnv,
      overrides: overrides
    };

    return this.serverPost(url, params, success, fail, true);
  },

  removeEndpointOverride: function(guid, cloudEnv, endpoint, success, fail) {
    var url = Constants.SECURE_ENDPOINTS_REMOVE_OVERRIDE_URL;
    var params = {
      appId: guid,
      environment: cloudEnv,
      endpoint: endpoint
    };
    return this.serverPost(url, params, success, fail, true);
  }
});