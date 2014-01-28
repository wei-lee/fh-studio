var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.FormBase = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: undefined,
  fetchURL : undefined,
  fetch : function(options){
    var self = this,
    id = this.get('_id');
    var csrfToken = $('input[name="csrftoken"]').val();

    $.ajax({
      type: 'GET',
      url: this.fetchURL.replace('{{id}}', id) + "?csrftoken="+csrfToken,
      success: function(res){
        self.set(res);
        if ($.isFunction(options.success)) {
          options.success(self, options);
        }
      },
      error: function(xhr, status){
        if ($.isFunction(options.error)) {
          options.error(arguments);
        }
      }
    });
  },
  destroy : function(options){
    var self = this,
    id = this.get('_id');
    $.ajax({
      type: 'DELETE',
      dataType : 'json',
      url: this.fetchURL.replace('{{id}}', id),
      success: function(res){
        self.trigger('destroy', self, self.collection, options);

      },
      error: function(xhr, status){
        if ($.isFunction(options.error)) {
          options.error(arguments);
        }
      }
    });
  }
});

App.Collection.FormBase = Backbone.Collection.extend({
  initialize: function() {},
  model : undefined,
  url: undefined,
  urlUpdate: undefined,
  sync: function (method, model, options) {
    this[method].apply(this, arguments);
  },
  read : function(method, model, options){
    var self = this,
    url = self.url,
    csrfToken = $('input[name="csrftoken"]').val();
    url += "?csrftoken=" + csrfToken;
    $.ajax({
      type: 'GET',
      dataType : 'json',
      url: url,
      cache: true,
      success: function(res){
        if ((res && res[self.pluralName]) || self.pluralName === false) {
          if ($.isFunction(options.success)) {
            var ret = (self.pluralName) ? res[self.pluralName] : res;
            _.each(ret, function(item){
              if (item.hasOwnProperty('id')){
                item._id = item.id;
              }
            });
            options.success(ret, options);
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
  },
  del : function(method, model, options){
    return options.success(model);
  },

  trimInternalIds : function(model) {
    var self = this,
    pages = model.pages;
    if (model._id && model._id.length < 24){
      // If it's some arbitrary internal ID we assigned, not a node ObjectID, delete it before pushing
      delete model._id;
    }
    _.each(pages, function(p){
      if (p._id && p._id.length < 24){
        // If it's some arbitrary internal ID we assigned, not a node ObjectID, delete it before pushing
        delete p._id;
        delete p.cid;
      }
      // Cater field lists by recursing - should only happen once..
      if (p.fields){
        _.each(p.fields, function(f){
          if (f._id && f._id.length < 24){
            // If it's some arbitrary internal ID we assigned, not a node ObjectID, delete it before pushing
            delete f._id;
          }
          delete f.cid;
        });
      }
    });
    return model;
  },
  create : function(method, model, options){
    return this.update.apply(this, arguments);
  },
  update : function(method, model, options){
    var self = this,
    url = self.urlUpdate,
    csrfToken = $('input[name="csrftoken"]').val();
    url += "?csrftoken=" + csrfToken;

    model = self.trimInternalIds(model);


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