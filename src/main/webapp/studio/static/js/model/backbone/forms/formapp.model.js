var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormApp = App.Model.FormBase.extend({
  fetchURL : '/api/v2/forms/app/{{id}}',
  fetch : function(options){
    return options.success(this);
  }
});

App.Collection.FormApps = App.Collection.FormBase.extend({
  pluralName : 'apps',
  initialize: function() {},
  model: App.Model.FormApp,
  url: '/studio/static/js/model/backbone/mocks/forms/formapps.json',
  urlUpdate: '/api/v2/forms/form'
});