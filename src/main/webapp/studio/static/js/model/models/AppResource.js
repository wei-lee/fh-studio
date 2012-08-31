model.AppResource = model.Model.extend({
  
  init: function () {
    
  },

  current: function (guid, env, success, fail) {
    var url = Constants.APP_RESOURCES_URL;
    var params = {
      "guid": guid, // instance guid
      "deploytarget": env
    };

    return this.serverPost(url, params, success, fail, true);
  },

  history: function (guid, env, success, fail) {
    var url = Constants.APP_RESOURCES_URL;
    var params = {
      "guid": guid, // instance guid
      "history": true,
      "deploytarget": env
    };

    return this.serverPost(url, params, success, fail, true);
  }
});