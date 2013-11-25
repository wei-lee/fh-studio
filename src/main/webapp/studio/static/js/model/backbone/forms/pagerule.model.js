var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.PageRule = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.PageRules = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.FieldRule,
  //url: '/studio/static/js/model/backbone/mocks/forms/themes.json', //TODO:
  urlUpdate: '/api/v2/forms/form/fieldRules',//TODO:
  sync: function (method, model, options) {
    console.log("sync called for model");
    this[method].apply(this, arguments);
  }
});
