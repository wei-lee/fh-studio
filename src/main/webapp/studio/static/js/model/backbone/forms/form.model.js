var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.Form = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: Backbone.HasMany,
    key: 'pages',
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
App.Collection.Form = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.Form,
  url: '/api/v2/forms/form/list',
  urlUpdate: '/api/v2/forms/form',
  sync: function (method, model, options) {
    this[method].apply(this, arguments);
  },
  read : function(method, model, options){
    var self = this;
    if(!self.loaded){
      var url = self.url;
      $.ajax({
        type: 'GET',
        url: url,
        cache: true,
        success: function(res){
          if (res && res.forms && res.forms.length && res.forms.length>0) {
            self.loaded = true;
            if ($.isFunction(options.success)) {
              options.success(res.forms, options);
            }
          } else {
            if ($.isFunction(options.error)) {
              options.error(res, options);
            }
          }
        },
        error: function(xhr, status){
          options.error(arguments);
        }
      });
    } else {
      self.trigger("sync");
    }
  },
  create : function(method, model, options){
    //TODO
    this.trigger('reset');
    return options.success(model);
  },
  del : function(method, model, options){
    //TODO
    return options.success(model);
  },

 trimInternalIds : function(fields) {
    var self = this;

    if (fields._id && fields._id.length < 24){
        delete f._id;
    }

    _.each(fields, function(f){
      if (f._id && f._id.length < 24){
        // If it's some arbitrary internal ID we assigned, not a node ObjectID, delete it before pushing
        delete f._id;
      }

      // Cater field lists by recursing - should only happen once..
      if (f.fields){
        f.fields = self.trimInternalIds(f.fields);
      }
      if (f.pages){
        f.pages = self.trimInternalIds(f.pages);
      }
    });

    return fields;
  },


  update : function(method, model, options){
    var self = this;
    var url = self.urlUpdate;
    
    model.pages = self.trimInternalIds(model.pages);

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(model),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      cache: true,
      success: function(res){
        if (res) {
          self.trigger('reset');
          if ($.isFunction(options.success)) {
            options.success(res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      },
      error: function(xhr, status){
        if ($.isFunction(options.error)) {
          options.error(arguments);
        }
      }
    });
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
    this.sync('del', model, opts);

  }
});