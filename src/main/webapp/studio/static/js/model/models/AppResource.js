model.AppResource = model.Model.extend({
  
  init: function () {
    
  },

  current: function (guid, env, success, fail) {
    if ($fw.getClientProp('cloudresources-sampledata-enabled') === 'true') {
      return success({
        "status": "ok",
        "data": {
          "max":{
            "cpu":100,
            "disk":104857600,
            "mem":268435456
          },
          "usage": {
            "cpu":3.7,
            "disk":26214400,
            "mem":12582912
          }
        }
      });
    } else {
      var url = Constants.APP_RESOURCES_URL;
      var params = {
        "guid": guid, // instance guid
        "deploytarget": env
      };
      return this.serverPost(url, params, success, fail, true);
    }
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