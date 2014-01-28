var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.FormNotification = App.Model.FormBase.extend({
  idAttribute: '_id',
  url: '/api/v2/forms/form/{{id}}/notifications',
  // Unlike our other form models, a group already has the info it needs - no server fetch required
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.FormNotifications = App.Collection.FormBase.extend({
  initialize: function(options) {
    this.options = options;
  },
  pluralName : 'subscribers',
  model: App.Model.FormNotification,
  urlPre: '/api/v2/forms/form/{{id}}/notifications',
  url: undefined,
  urlUpdate: undefined,
  read : function(){
    this.url = this.urlPre.replace('{{id}}', this.options._id);
    return App.Collection.FormBase.prototype.read.apply(this, arguments);
  },
  parse : function(response){
    // Returns array of strings - backbone doesn't know what to do with this
    var models = [];
    _.each(response, function(e){
      models.push({email : e});
    });
    return models;
  },
  update : function(method, model, options){
    var emails = _.pluck(model, 'email');
    this.urlUpdate = this.urlPre.replace('{{id}}', this.options._id);
    model = { subscribers : emails };
    return App.Collection.FormBase.prototype.update.apply(this, arguments);
  }
});