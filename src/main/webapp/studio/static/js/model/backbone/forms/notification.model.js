var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.FormNotification = App.Model.FormBase.extend({
  idAttribute: '_id',
  url: '/studio/static/js/model/backbone/mocks/forms/notifications.json',
  // Unlike our other form models, a group already has the info it needs - no server fetch required
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.FormNotifications = App.Collection.FormBase.extend({
  initialize: function() {},
  pluralName : 'subscribers',
  model: App.Model.FormNotification,
  url: '/studio/static/js/model/backbone/mocks/forms/notifications.json',
  urlUpdate: '/studio/static/js/model/backbone/mocks/forms/notifications.json',
  parse : function(response){
    // Returns array of strings - backbone doesn't know what to do with this
    var models = [];
    _.each(response, function(e){
      models.push({email : e});
    });
    return models;
  },
  update : function(method, model, options){
    var emails = _.pluck(this.toJSON(), 'email');
    return App.Collection.FormBase.prototype.update.apply(this, ['update', { subscribers : emails }, options]);
  }
});