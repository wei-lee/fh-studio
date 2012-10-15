model.CloudNotifications = model.Model.extend({
  
  init: function () {
    
  },

  setEmail: function (guid, email, success, fail) {
    var url = Constants.APP_SETPROPERTY_URL;
    var params = {
      "guid": guid, // instance guid
      "key": "notification_email",
      "value": email
    };
    return this.serverPost(url, params, success, fail, true);
  }
});