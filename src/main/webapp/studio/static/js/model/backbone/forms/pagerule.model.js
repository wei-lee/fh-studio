var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.PageRule = Backbone.RelationalModel.extend({
  idAttribute: '_id'
});

App.Collection.PageRules = App.Collection.FormBase.extend({
  initialize: function() {},
  model: App.Model.FieldRule,
  urlUpdate: '/api/v2/forms/form/pagerules',


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
  }
});
