var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};


App.Model.EventAlert = Backbone.Model.extend({
  rootUrl: '/box/srv/1.1/cm/eventlog/alert',
  sync: function (method, model, options) {
    var url = this.get("rootUrl") + "/" + method;
    $fw.server.post(url, model.toJSON(), function(res) {
      if (res.status === "ok") {
        if ($.isFunction(options.success)) {
          options.success(model, res, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(model, res.message, options);
        }
      }
    }, options.error, true);
  }
});

App.Collection.EventAlerts = Backbone.Collection.extend({
  model: App.Model.EventAlert,

  initialize: function () {
  },

  sync: function(method, model, options){
    var url = '/box/srv/1.1/cm/eventlog/alert/list';
    if("read" === method){
      var instGuid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      $fw.server.post(url, {uid: instGuid, env: cloudEnv}, function(res){
        if (res.status === "ok") {
          if ($.isFunction(options.success)) {
            options.success(model, res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(model, res.message, options);
          }
        }
      }, options.error, true );
    } else {
      console.log("EventAlerts collection do not support" + method);
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

App.collections.event_alerts = new App.Collection.EventAlerts();