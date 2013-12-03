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
  urlUpdate: '/api/v2/forms/form/pagerules',

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
        success: function(res){
          if ($.isFunction(options.error)) {
            options.error(res, options);
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
  trimInternalIds : function(pages) {
    var self = this;



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

    return pages;
  },
  update : function(method, model, options){
    var self = this;
    var url = self.urlUpdate;




    var data = {
      "formId":model.formid,
      "rules":model.rules
    };

    console.log("model ",data);

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
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
