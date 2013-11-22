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