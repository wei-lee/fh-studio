var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.AlertNotification = Backbone.Model.extend({

});

App.Collection.AlertNotifications = Backbone.Collection.extend({
  model: App.Model.AlertNotification,

  initialize: function () {
  },

  sync: function(method, model, options){
    var url = '/box/srv/1.1/cm/eventlog/alert/listAudits';
    if("read" === method){
      var instGuid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      $fw.server.post(url, {uid: instGuid, env: cloudEnv}, function(res){
        if (res.status === "ok") {
          if ($.isFunction(options.success)) {
            options.success(res);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res);
          }
        }
      }, options.error, true );
    } else {
      console.log("AlertNotifications collection do not support" + method);
      if($.isFunction(options.error)){
        options.error(model, "not_supported", options);
      }
    }
  },

  parse: function (response) {
    var list = response.list;
    return list;
  }
});

App.collections.alerts_notifications = new App.Collection.AlertNotifications();