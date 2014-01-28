var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FieldRule = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.FieldRules = App.Collection.FormBase.extend({
  initialize: function() {},
  model: App.Model.FieldRule,
  urlUpdate: '/api/v2/forms/form/fieldRules'
});
