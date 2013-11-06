var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.Form = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: Backbone.HasMany,
    key: 'Pages',
    relatedModel: 'App.Model.FormPage',
    collectionType: 'App.Collection.FormPages',
    reverseRelation: {
      key: 'form',
      includeInJSON: 'id'
    }
  }]
});

App.Model.FormPage = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: Backbone.HasMany,
    key: 'Fields',
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
App.Collection.Form = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.Form,
  url: '/studio/static/js/model/backbone/mocks/forms.json',
  sync: function (method, model, options) {
    this[method].apply(this, arguments);
  },
  read : function(method, model, options){
    var self = this;
    if(!self.loaded){
      var url = self.url;
      $fw.server.post(url, {}, function(res) {
        if (res && res.length && res.length>0) {
          var massaged = [];
          _.each(res, function(r){
            massaged.push(r.data);
          });
          self.loaded = true;
          if ($.isFunction(options.success)) {
            options.success(massaged, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      }, options.error, true);
    } else {
      self.trigger("sync");
    }
  },
  create : function(method, model, options){
    //TODO
    return options.success(model);
  },
  delete : function(method, model, options){
    //TODO
    return options.success(model);
  },
  remove : function(model, options){
    Backbone.Collection.prototype.remove.apply(this, arguments);
    var self = this,
    opts = {
      success : function(){
        self.trigger('reset');
        options.success.apply(self, arguments);
      }, error : options.error
    };
    this.sync('delete', model, opts);

  },
});