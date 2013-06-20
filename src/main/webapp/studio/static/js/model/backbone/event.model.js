var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};


App.Model.CloudEvent = Backbone.Model.extend({

});

App.Collection.CloudEvents = Backbone.Collection.extend({
  model: App.Model.CloudEvent,

  //url: '/studio/static/js/model/backbone/mocks/cloud_notifications.json',

  initialize: function() {},

  eventFilters: {'eventCategories':[], 'eventNames':[], 'eventSeverities':[]},

  sync: function(method, model, options){
    var url = '/box/srv/1.1/app/eventlog/listEvents';
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
      console.log("EventLog collection do not support" + method);
      if($.isFunction(options.error)){
        options.error(model, "not_supported", options);
      }
    }
  },

  parse: function(response) {
    // Need to munge slightly, since this endpoint returns params nested in a "fields" key
    // NOTE TO SELF: FIND THE PERSON RESPONSIBLE FOR THIS

    var list = response.list;
    var parsed_list = [];
    var self = this;

    _.each(list, function(item) {
      var fields = item.fields;
      var merged = _.extend(item, fields);
      delete merged.fields;
      parsed_list.push(merged);
      if(self.eventFilters.eventCategories.indexOf(merged.category) === -1){
        self.eventFilters.eventCategories.push(merged.category);
      }
      if(self.eventFilters.eventNames.indexOf(merged.eventType) === -1){
        self.eventFilters.eventNames.push(merged.eventType);
      }
      if(self.eventFilters.eventSeverities.indexOf(merged.severity) === -1){
        self.eventFilters.eventSeverities.push(merged.severity);
      }
    });

    return parsed_list;
  },

  filterEvents: function(filters){
    var matched = [];
    var self = this;
    _.each(filters, function(filter){
      var eventClasses = filter.get("eventCategories");
      var eventStates = filter.get("eventNames");
      var severities = filter.get("eventSeverities");
      var models = self.models;
      for(var i=0;i<models.length;i++){
        var model = models[i];
        var match = false;
        if(eventClasses === "" || eventClasses.indexOf(model.get("category")) > -1){
          match = true;
        } else {
          match = false;
        }
        if(match && (eventStates === "" || eventStates.indexOf(model.get("eventType")) > -1)){
          match = true;
        } else {
          match = false;
        }
        if(match && (severities === "" ||severities.indexOf(model.get("severity")) > -1 )){
          match = true;
        } else {
          match = false;
        }
        if( match ){
          matched.push(model);
        }
      }
    });
    return matched;
  }
});

App.collections.cloud_events = new App.Collection.CloudEvents();
