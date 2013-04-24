var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};


App.Model.Event = Backbone.Model.extend({});

App.Collection.CloudEvents = Backbone.Collection.extend({
  model: App.Model.Event,

  url: '/studio/static/js/model/backbone/mocks/cloud_notifications.json',

  initialize: function() {},

  // sync: function(method, collection, options) {
  //   options || (options = {});
  //   options.url = this.url;
  //   var instGuid = $fw.data.get('inst').guid;
  //   // var cloudEnv = $fw.data.get('cloud_environment');
  //   options.data = {
  //     appGuid: instGuid
  //   };
  //   options.type = "POST";
  //   return Backbone.sync(method, collection, options);
  // },

  parse: function(response) {
    // Need to munge slightly, since this endpoint returns params nested in a "fields" key
    // NOTE TO SELF: FIND THE PERSON RESPONSIBLE FOR THIS

    var list = response.list;
    var parsed_list = [];

    _.each(list, function(item) {
      var fields = item.fields;
      var merged = _.extend(item, fields);
      delete merged.fields;
      parsed_list.push(merged);
    });

    return parsed_list;
  }
});

App.collections.cloud_events = new App.Collection.CloudEvents();
