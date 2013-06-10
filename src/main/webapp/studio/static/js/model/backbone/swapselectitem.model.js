var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.SwapSelectItem = Backbone.Model.extend({

});

App.Collection.SwapSelectItems = Backbone.Collection.extend({
   model: App.Model.SwapSelectItem,
   fetch: function(){
     this.trigger('sync');
   }
});