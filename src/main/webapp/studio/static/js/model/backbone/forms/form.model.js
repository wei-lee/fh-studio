var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.Form = App.Model.FormBase.extend({
  relations: [{
    type: Backbone.HasMany,
    key: 'pages',
    relatedModel: 'App.Model.FormPage',
    collectionType: 'App.Collection.FormPages',
    reverseRelation: {
      key: 'form',
      includeInJSON: 'id'
    }
  }],
  fetchURL : '/api/v2/forms/form/{{id}}'
});

App.Model.FormPage = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: Backbone.HasMany,
    key: 'fields',
    relatedModel: 'Field',
    collectionType: 'App.Collection.FormFields',
    reverseRelation: {
      key: 'page',
      includeInJSON: 'id'
    }
  }]
});

App.Model.FormField = Backbone.RelationalModel.extend({idAttribute: '_id'});

App.Collection.FormPages = Backbone.Collection.extend({ model : App.Model.FormPage });
App.Collection.FormFields = Backbone.Collection.extend({ model : App.Model.FormField });
App.Collection.Form = App.Collection.FormBase.extend({
  pluralName : 'forms',
  initialize: function() {},
  model: App.Model.Form,
  url: '/api/v2/forms/form/list',
  urlUpdate: '/api/v2/forms/form'
});