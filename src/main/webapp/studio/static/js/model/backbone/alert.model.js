var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.models = App.models || {};


App.Model.EventAlert = Backbone.Model.extend({
  idAttribute: "guid",
  rootUrl: '/box/srv/1.1/cm/eventlog/alert',

  //url: '/studio/static/js/model/backbone/mocks/event_alert.json',

  sync: function (method, model, options) {
    var url = this.rootUrl + "/" + method;
    var instGuid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    model.set("uid", instGuid);
    model.set("env", cloudEnv);
    $fw.server.post(url, model.toJSON(), function(res) {
      if (res.status === "ok") {
        if ($.isFunction(options.success)) {
          options.success(res, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(res, options);
        }
      }
    }, options.error, true);
  },

  validate: function(attrs, options){
    if(attrs.alertName === ""){
      return "Alert name can not be empty";
    }
    if(attrs.emails === ""){
      return "Emails can not be empty";
    } else {
      var invalidEmail = this.checkEmailAddresses(attrs.emails);
      if(invalidEmail){
        return invalidEmail + " is not a valid email address";
      }
    }
    if(attrs.eventCategories === "" && attrs.eventNames === "" && attrs.eventSeverities === ""){
      return "None of event classes, event states or event serverities is set";
    }
  },

  checkEmailAddresses: function(emails){
    var adds = emails.split(",");
    for(var i=0;i<adds.length;i++){
      if(!/^.+@.+/.test(adds[i])){
        return adds[i];
      }
    }
    return null;
  },

  testEmails: function(emails, options){
    var url = this.rootUrl + "/testEmails";
    $fw.server.post(url, {emails: emails}, function(res) {
      if (res.status === "ok") {
        if ($.isFunction(options.success)) {
          options.success(res, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(res, options);
        }
      }
    }, options.error, true);
  }
});

App.Model.AlertFilter = Backbone.Model.extend({
  loaded: false,

  //url: '/studio/static/js/model/backbone/mocks/event_options.json',
  idAttribute: "name",
  sync: function (method, model, options) {
    var self = this;
    if(!self.loaded){
      var url = '/box/srv/1.1/cm/eventlog/alert/listOptions';
      $fw.server.post(url, {}, function(res) {
        if (res.status === "ok") {
          self.loaded = true;
          if ($.isFunction(options.success)) {
            options.success(res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      }, options.error, true);
    } else {
      self.trigger("sync");
    }
  }
});

App.models.alertFilters = new App.Model.AlertFilter();

App.Collection.EventAlerts = Backbone.Collection.extend({
  model: App.Model.EventAlert,

  //url: '/studio/static/js/model/backbone/mocks/event_alerts.json',

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
            options.success(res);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res);
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

App.Collection.AlertFilters = Backbone.Collection.extend({
   fetch: function(){
     this.trigger("sync");
   }
});

App.collections.event_alerts = new App.Collection.EventAlerts();